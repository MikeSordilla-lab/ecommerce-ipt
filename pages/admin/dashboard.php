<?php
$page_title = 'Admin Dashboard';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_role('admin');

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

} catch (PDOException $e) {
    $stats = ['users' => 0, 'products' => 0, 'orders' => 0, 'pending_sellers' => 0];
    $recent_orders = [];
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
                                    <td>$<?= number_format($order['total'], 2) ?></td>
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

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>