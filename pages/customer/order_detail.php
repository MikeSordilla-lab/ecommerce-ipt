<?php
$page_title = 'Order Details';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_role('customer');

$user_id = $_SESSION['user_id'];
$order_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

try {
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
    $stmt->execute([$order_id, $user_id]);
    $order = $stmt->fetch();

    if (!$order) {
        set_flash('error', 'Error', 'Order not found.');
        redirect(SITE_URL . '/pages/customer/orders.php');
    }

    $items = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $items->execute([$order_id]);
    $items = $items->fetchAll();

    $shipping = json_decode($order['shipping_address'], true);
} catch (PDOException $e) {
    set_flash('error', 'Error', 'Could not load order.');
    redirect(SITE_URL . '/pages/customer/orders.php');
}

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container">
    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="<?= SITE_URL ?>/pages/customer/orders.php">Orders</a></li>
            <li class="breadcrumb-item active">Order #<?= $order_id ?></li>
        </ol>
    </nav>

    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow-primary mb-4">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <h3 class="h5 mb-0 text-heading">Order #<?= $order_id ?></h3>
                    <span class="badge badge-<?= match($order['status']) { 'pending' => 'warning', 'shipped' => 'info', 'delivered' => 'success', default => 'secondary' } ?>">
                        <?= ucfirst($order['status']) ?>
                    </span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($items as $item): ?>
                                    <tr>
                                        <td><?= sanitize($item['product_name']) ?></td>
                                        <td>$<?= number_format($item['price_at_purchase'], 2) ?></td>
                                        <td><?= $item['quantity'] ?></td>
                                        <td>$<?= number_format($item['price_at_purchase'] * $item['quantity'], 2) ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <div class="d-flex justify-content-between">
                        <span class="text-body">Total</span>
                        <strong class="text-heading">$<?= number_format($order['total'], 2) ?></strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card shadow-primary mb-4">
                <div class="card-header bg-white">
                    <h3 class="h5 mb-0 text-heading">Order Status</h3>
                </div>
                <div class="card-body">
                    <ul class="list-unstyled">
                        <li class="mb-3">
                            <div class="d-flex align-items-center">
                                <div class="me-2">
                                    <i class="bi bi-<?= in_array($order['status'], ['pending', 'shipped', 'delivered']) ? 'check-circle-fill text-success' : 'circle' ?>"></i>
                                </div>
                                <div>
                                    <strong>Pending</strong>
                                    <?php if ($order['status'] === 'pending'): ?>
                                        <div class="small text-body">Awaiting processing</div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </li>
                        <li class="mb-3">
                            <div class="d-flex align-items-center">
                                <div class="me-2">
                                    <i class="bi bi-<?= in_array($order['status'], ['shipped', 'delivered']) ? 'check-circle-fill text-success' : 'circle' ?>"></i>
                                </div>
                                <div>
                                    <strong>Shipped</strong>
                                    <?php if ($order['status'] === 'shipped'): ?>
                                        <div class="small text-body">On the way</div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="d-flex align-items-center">
                                <div class="me-2">
                                    <i class="bi bi-<?= $order['status'] === 'delivered' ? 'check-circle-fill text-success' : 'circle' ?>"></i>
                                </div>
                                <div>
                                    <strong>Delivered</strong>
                                    <?php if ($order['status'] === 'delivered'): ?>
                                        <div class="small text-body">Order completed</div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="card shadow-primary">
                <div class="card-header bg-white">
                    <h3 class="h5 mb-0 text-heading">Shipping Address</h3>
                </div>
                <div class="card-body">
                    <p class="mb-1"><strong><?= sanitize($shipping['full_name'] ?? '') ?></strong></p>
                    <p class="text-body mb-1"><?= sanitize($shipping['phone'] ?? '') ?></p>
                    <p class="text-body mb-0"><?= nl2br(sanitize($shipping['address'] ?? '')) ?></p>
                </div>
            </div>

            <?php if ($order['notes']): ?>
                <div class="card shadow-primary mt-4">
                    <div class="card-header bg-white">
                        <h3 class="h5 mb-0 text-heading">Order Notes</h3>
                    </div>
                    <div class="card-body">
                        <p class="text-body mb-0"><?= nl2br(sanitize($order['notes'])) ?></p>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>