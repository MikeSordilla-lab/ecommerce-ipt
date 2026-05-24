<?php
$page_title = 'Admin Dashboard';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_role('admin');

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

    $stats['users'] = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $stats['products'] = $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
    $stats['orders'] = $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    $stats['pending_sellers'] = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'seller' AND is_approved = 0")->fetchColumn();

    $recent_orders = $pdo->query('
        SELECT o.*, u.username
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
    ')->fetchAll();

    $orders_by_status = $pdo->query("
        SELECT status, COUNT(*) AS total
        FROM orders
        GROUP BY status
    ")->fetchAll();

    $daily_orders = $pdo->query("
        SELECT DATE(created_at) AS order_date, COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
        GROUP BY DATE(created_at)
        ORDER BY order_date
    ")->fetchAll();

    $products_by_category = $pdo->query("
        SELECT c.name, COUNT(p.id) AS total
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY total DESC, c.name
    ")->fetchAll();

    $users_by_role_verified = $pdo->query("
        SELECT role, SUM(email_verified_at IS NOT NULL) AS verified, SUM(email_verified_at IS NULL) AS unverified
        FROM users
        GROUP BY role
    ")->fetchAll();

} catch (PDOException $e) {
    $stats = ['users' => 0, 'products' => 0, 'orders' => 0, 'pending_sellers' => 0];
    $recent_orders = [];
    $orders_by_status = [];
    $daily_orders = [];
    $products_by_category = [];
    $users_by_role_verified = [];
}

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">Admin Dashboard</h1>

    <div class="row g-4 mb-4">
        <div class="col-md-3">
            <div class="card shadow-primary">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="bi bi-people text-primary" style="font-size: 2rem;"></i>
                        </div>
                        <div>
                            <h3 class="mb-0"><?= $stats['users'] ?></h3>
                            <small class="text-body">Total Users</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card shadow-primary">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="bi bi-box text-primary" style="font-size: 2rem;"></i>
                        </div>
                        <div>
                            <h3 class="mb-0"><?= $stats['products'] ?></h3>
                            <small class="text-body">Products</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card shadow-primary">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="bi bi-box-seam text-primary" style="font-size: 2rem;"></i>
                        </div>
                        <div>
                            <h3 class="mb-0"><?= $stats['orders'] ?></h3>
                            <small class="text-body">Orders</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card shadow-primary">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="bi bi-person-check text-warning" style="font-size: 2rem;"></i>
                        </div>
                        <div>
                            <h3 class="mb-0"><?= $stats['pending_sellers'] ?></h3>
                            <small class="text-body">Pending Sellers</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <div class="col-lg-6">
            <div class="card shadow-primary h-100">
                <div class="card-header bg-white"><h3 class="h5 mb-0 text-heading">Orders by Status</h3></div>
                <div class="card-body"><div class="chart-box"><canvas id="ordersStatusChart"></canvas></div></div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card shadow-primary h-100">
                <div class="card-header bg-white"><h3 class="h5 mb-0 text-heading">Revenue and Orders</h3></div>
                <div class="card-body"><div class="chart-box"><canvas id="dailyRevenueChart"></canvas></div></div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card shadow-primary h-100">
                <div class="card-header bg-white"><h3 class="h5 mb-0 text-heading">Products by Category</h3></div>
                <div class="card-body"><div class="chart-box"><canvas id="productsCategoryChart"></canvas></div></div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card shadow-primary h-100">
                <div class="card-header bg-white"><h3 class="h5 mb-0 text-heading">Users by Role and Verification</h3></div>
                <div class="card-body"><div class="chart-box"><canvas id="usersVerificationChart"></canvas></div></div>
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
                    <p class="text-body mb-0">No orders yet</p>
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
                                        <?php
                                        $status_class = match($order['status']) {
                                            'pending' => 'warning',
                                            'shipped' => 'info',
                                            'delivered' => 'success',
                                            default => 'secondary'
                                        };
                                        ?>
                                        <span class="badge badge-<?= $status_class ?>"><?= ucfirst($order['status']) ?></span>
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

    var statusRows = <?= json_encode($orders_by_status, JSON_NUMERIC_CHECK) ?>;
    var dailyRows = <?= json_encode($daily_orders, JSON_NUMERIC_CHECK) ?>;
    var categoryRows = <?= json_encode($products_by_category, JSON_NUMERIC_CHECK) ?>;
    var userRows = <?= json_encode($users_by_role_verified, JSON_NUMERIC_CHECK) ?>;
    var stableChartOptions = { responsive: true, maintainAspectRatio: false, resizeDelay: 150 };
    function chartOptions(options) {
        return Object.assign({}, stableChartOptions, options || {});
    }

    new Chart(document.getElementById('ordersStatusChart'), {
        type: 'doughnut',
        data: {
            labels: statusRows.map(row => row.status),
            datasets: [{ data: statusRows.map(row => row.total), backgroundColor: ['#f59e0b', '#0ea5e9', '#22c55e'] }]
        },
        options: chartOptions()
    });

    new Chart(document.getElementById('dailyRevenueChart'), {
        type: 'line',
        data: {
            labels: dailyRows.map(row => row.order_date),
            datasets: [
                { label: 'Revenue', data: dailyRows.map(row => row.revenue), borderColor: '#533afd', backgroundColor: 'rgba(83,58,253,.12)', tension: .25, yAxisID: 'y' },
                { label: 'Orders', data: dailyRows.map(row => row.order_count), borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,.12)', tension: .25, yAxisID: 'y1' }
            ]
        },
        options: chartOptions({ interaction: { mode: 'index', intersect: false }, scales: { y1: { position: 'right', grid: { drawOnChartArea: false } } } })
    });

    new Chart(document.getElementById('productsCategoryChart'), {
        type: 'bar',
        data: {
            labels: categoryRows.map(row => row.name),
            datasets: [{ label: 'Products', data: categoryRows.map(row => row.total), backgroundColor: '#533afd' }]
        },
        options: chartOptions()
    });

    new Chart(document.getElementById('usersVerificationChart'), {
        type: 'bar',
        data: {
            labels: userRows.map(row => row.role),
            datasets: [
                { label: 'Verified', data: userRows.map(row => row.verified), backgroundColor: '#22c55e' },
                { label: 'Unverified', data: userRows.map(row => row.unverified), backgroundColor: '#f59e0b' }
            ]
        },
        options: chartOptions({ scales: { x: { stacked: true }, y: { stacked: true } } })
    });
});
</script>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>
