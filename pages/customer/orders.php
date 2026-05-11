<?php
$page_title = "My Orders";
require_once __DIR__ . "/../../includes/config.php";
require_once __DIR__ . "/../../includes/functions.php";
require_once __DIR__ . "/../../includes/auth.php";

require_role("customer");

$user_id = $_SESSION["user_id"];

try {
    $orders = $pdo->prepare(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    );
    $orders->execute([$user_id]);
    $orders = $orders->fetchAll();
} catch (PDOException $e) {
    $orders = [];
}

require_once __DIR__ . "/../../includes/header.php";
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">My Orders</h1>

    <?php if (empty($orders)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-box-seam"></i></div>
            <h2 class="empty-state-title">You haven't placed any orders yet</h2>
            <p class="empty-state-text">Start shopping to see your orders here.</p>
            <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-primary">Start Shopping</a>
        </div>
    <?php else: ?>
        <div class="card shadow-primary">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Payment Status</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($orders as $order): ?>
                                <tr>
                                    <td>#<?= $order["id"] ?></td>
                                    <td><?= date(
                                        "M d, Y",
                                        strtotime($order["created_at"]),
                                    ) ?></td>
                                    <td><?= format_currency(
                                        $order["total"],
                                    ) ?></td>
                                    <td><?= sanitize(
                                        get_payment_method_label(
                                            $order["payment_method"],
                                        ),
                                    ) ?></td>
                                    <td><span class="badge badge-warning"><?= sanitize(
                                        get_payment_status_label(
                                            $order["payment_method"],
                                            $order["status"],
                                        ),
                                    ) ?></span></td>
                                    <td>
                                        <span class="badge badge-<?= match (
                                            $order["status"]
                                        ) {
                                            "pending" => "warning",
                                            "shipped" => "info",
                                            "delivered" => "success",
                                            default => "secondary",
                                        } ?>">
                                            <?= ucfirst($order["status"]) ?>
                                        </span>
                                    </td>
                                    <td>
                                        <a href="<?= SITE_URL ?>/pages/customer/order_detail.php?id=<?= $order[
    "id"
] ?>" class="btn btn-sm btn-outline-primary">
                                            View Details
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . "/../../includes/footer.php"; ?>
