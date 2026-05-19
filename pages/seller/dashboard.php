<?php
$page_title = 'Seller Dashboard';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_approved_seller();

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare('SELECT username, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $current_user = $stmt->fetch();
} catch (PDOException $e) {
    $current_user = null;
}

try {
    $stats = [];

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM products WHERE seller_id = ?');
    $stmt->execute([$user_id]);
    $stats['products'] = $stmt->fetchColumn();

    $stmt = $pdo->prepare('
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.product_id IN (SELECT id FROM products WHERE seller_id = ?)
    ');
    $stmt->execute([$user_id]);
    $stats['total_orders'] = $stmt->fetchColumn();

    $stmt = $pdo->prepare('
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.product_id IN (SELECT id FROM products WHERE seller_id = ?)
        AND o.status = \'pending\'
    ');
    $stmt->execute([$user_id]);
    $stats['pending_orders'] = $stmt->fetchColumn();

    $stmt = $pdo->prepare('
        SELECT DISTINCT o.*, u.username
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.user_id = u.id
        WHERE oi.product_id IN (SELECT id FROM products WHERE seller_id = ?)
        ORDER BY o.created_at DESC
        LIMIT 10
    ');
    $stmt->execute([$user_id]);
    $recent_orders = $stmt->fetchAll();

    $stmt = $pdo->prepare('
        SELECT DATE(o.created_at) AS order_date,
               COUNT(DISTINCT o.id) AS order_count,
               COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE p.seller_id = ?
          AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        GROUP BY DATE(o.created_at)
        ORDER BY order_date
    ');
    $stmt->execute([$user_id]);
    $daily_sales = $stmt->fetchAll();

    $stmt = $pdo->prepare('
        SELECT p.name, COALESCE(SUM(oi.quantity), 0) AS units_sold
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        WHERE p.seller_id = ?
        GROUP BY p.id, p.name
        ORDER BY units_sold DESC, p.name
        LIMIT 8
    ');
    $stmt->execute([$user_id]);
    $top_products = $stmt->fetchAll();

    $stmt = $pdo->prepare('
        SELECT name, stock
        FROM products
        WHERE seller_id = ?
        ORDER BY stock ASC, name ASC
        LIMIT 10
    ');
    $stmt->execute([$user_id]);
    $stock_levels = $stmt->fetchAll();

} catch (PDOException $e) {
    $stats = ['products' => 0, 'total_orders' => 0, 'pending_orders' => 0];
    $recent_orders = [];
    $daily_sales = [];
    $top_products = [];
    $stock_levels = [];
}

require_once __DIR__ . '/../../includes/header.php';
?>

<?php if ($current_user): ?>
<div class="container">
    <div class="card shadow-primary mb-4 profile-card">
        <div class="card-body py-3">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="profile-avatar-sm">
                        <i class="bi bi-person-circle"></i>
                    </div>
                </div>
                <div class="col">
                    <div class="fw-medium text-heading"><?= sanitize($current_user['username']) ?></div>
                    <div class="small text-body"><?= sanitize($current_user['email']) ?></div>
                </div>
                <div class="col-auto">
                    <span class="badge badge-info">Seller</span>
                </div>
                <div class="col-auto">
                    <small class="text-body">Member since <?= date('M Y', strtotime($current_user['created_at'])) ?></small>
                </div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">Seller Dashboard</h1>

    <div class="row g-4 mb-4">
        <div class="col-md-4">
            <div class="card shadow-primary">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3"><i class="bi bi-box text-primary" style="font-size: 2rem;"></i></div>
                        <div>
                            <h3 class="mb-0"><?= $stats['products'] ?></h3>
                            <small class="text-body">Products Listed</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-primary">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3"><i class="bi bi-box-seam text-primary" style="font-size: 2rem;"></i></div>
                        <div>
                            <h3 class="mb-0"><?= $stats['total_orders'] ?></h3>
                            <small class="text-body">Total Orders</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-primary">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3"><i class="bi bi-clock text-warning" style="font-size: 2rem;"></i></div>
                        <div>
                            <h3 class="mb-0"><?= $stats['pending_orders'] ?></h3>
                            <small class="text-body">Pending Orders</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <div class="col-lg-6">
            <div class="card shadow-primary h-100">
                <div class="card-header bg-white"><h3 class="h5 mb-0 text-heading">Revenue and Orders</h3></div>
                <div class="card-body"><canvas id="sellerRevenueChart" height="140"></canvas></div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card shadow-primary h-100">
                <div class="card-header bg-white"><h3 class="h5 mb-0 text-heading">Top Selling Products</h3></div>
                <div class="card-body"><canvas id="sellerTopProductsChart" height="140"></canvas></div>
            </div>
        </div>
        <div class="col-lg-12">
            <div class="card shadow-primary h-100">
                <div class="card-header bg-white"><h3 class="h5 mb-0 text-heading">Lowest Stock Products</h3></div>
                <div class="card-body"><canvas id="sellerStockChart" height="100"></canvas></div>
            </div>
        </div>
    </div>

    <div class="card shadow-primary">
        <div class="card-header bg-white">
            <h3 class="h5 mb-0 text-heading">Recent Orders</h3>
        </div>
        <div class="card-body p-0">
            <?php if (empty($recent_orders)): ?>
                <div class="empty-state py-4">
                    <p class="text-body mb-0">No orders for your products yet</p>
                </div>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recent_orders as $order): ?>
                                <tr>
                                    <td>#<?= $order['id'] ?></td>
                                    <td><?= sanitize($order['username']) ?></td>
                                    <td><?= format_currency($order['total']) ?></td>
                                    <td>
                                        <span class="badge badge-<?= match($order['status']) { 'pending' => 'warning', 'shipped' => 'info', 'delivered' => 'success', default => 'secondary' } ?>">
                                            <?= ucfirst($order['status']) ?>
                                        </span>
                                    </td>
                                    <td><?= date('M d, Y', strtotime($order['created_at'])) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    if (!window.Chart) return;

    var dailyRows = <?= json_encode($daily_sales, JSON_NUMERIC_CHECK) ?>;
    var topRows = <?= json_encode($top_products, JSON_NUMERIC_CHECK) ?>;
    var stockRows = <?= json_encode($stock_levels, JSON_NUMERIC_CHECK) ?>;

    new Chart(document.getElementById('sellerRevenueChart'), {
        type: 'line',
        data: {
            labels: dailyRows.map(row => row.order_date),
            datasets: [
                { label: 'Revenue', data: dailyRows.map(row => row.revenue), borderColor: '#533afd', backgroundColor: 'rgba(83,58,253,.12)', tension: .25, yAxisID: 'y' },
                { label: 'Orders', data: dailyRows.map(row => row.order_count), borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,.12)', tension: .25, yAxisID: 'y1' }
            ]
        },
        options: { interaction: { mode: 'index', intersect: false }, scales: { y1: { position: 'right', grid: { drawOnChartArea: false } } } }
    });

    new Chart(document.getElementById('sellerTopProductsChart'), {
        type: 'bar',
        data: {
            labels: topRows.map(row => row.name),
            datasets: [{ label: 'Units Sold', data: topRows.map(row => row.units_sold), backgroundColor: '#533afd' }]
        }
    });

    new Chart(document.getElementById('sellerStockChart'), {
        type: 'bar',
        data: {
            labels: stockRows.map(row => row.name),
            datasets: [{ label: 'Stock', data: stockRows.map(row => row.stock), backgroundColor: stockRows.map(row => row.stock <= 5 ? '#ef4444' : '#22c55e') }]
        }
    });
});
</script>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>
