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

} catch (PDOException $e) {
    $stats = ['products' => 0, 'total_orders' => 0, 'pending_orders' => 0];
    $recent_orders = [];
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
                                    <td>$<?= number_format($order['total'], 2) ?></td>
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

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>