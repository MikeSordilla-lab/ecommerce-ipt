<?php
$page_title = "Order Management";
require_once __DIR__ . "/../../includes/config.php";
require_once __DIR__ . "/../../includes/functions.php";
require_once __DIR__ . "/../../includes/auth.php";
require_once __DIR__ . "/../../includes/modules/OrderStatusModule.php";
require_role("admin");

try {
    $orders = $pdo
        ->query(
            '
        SELECT o.*, u.username
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    ',
        )
        ->fetchAll();
} catch (PDOException $e) {
    $orders = [];
}

generate_csrf();
require_once __DIR__ . "/../../includes/header.php";
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">Order Management</h1>

    <?php if (empty($orders)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-box-seam"></i></div>
            <h2 class="empty-state-title">No orders found</h2>
            <p class="empty-state-text">No orders have been placed yet.</p>
        </div>
    <?php else: ?>
        <div class="card shadow-primary">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Payment Status</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($orders as $order): ?>
                                <tr>
                                    <td>#<?= $order["id"] ?></td>
                                    <td><?= sanitize($order["username"]) ?></td>
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
                                        <span class="badge badge-<?= OrderStatusModule::badgeClass(
                                            $order["status"],
                                        ) ?>">
                                            <?= sanitize(
                                                OrderStatusModule::label(
                                                    $order["status"],
                                                ),
                                            ) ?>
                                        </span>
                                    </td>
                                    <td><?= date(
                                        "M d, Y",
                                        strtotime($order["created_at"]),
                                    ) ?></td>
                                    <td class="actions-cell">
                                        <form method="POST" action="<?= SITE_URL ?>/api/order_status.php" class="order-status-form d-flex gap-2" data-order-id="<?= $order[
    "id"
] ?>">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="order_id" value="<?= $order[
                                                "id"
                                            ] ?>">
                                            <select name="status" class="form-select form-select-sm">
                                                <?php foreach (
                                                    OrderStatusModule::selectableStatuses(
                                                        $order["status"],
                                                    )
                                                    as $status
                                                ): ?>
                                                <option value="<?= $status ?>" <?= $order[
    "status"
] === $status
    ? "selected"
    : "" ?>>
                                                    <?= sanitize(
                                                        OrderStatusModule::label(
                                                            $status,
                                                        ),
                                                    ) ?>
                                                </option>
                                                <?php endforeach; ?>
                                            </select>
                                            <button type="submit" class="icon-btn icon-btn-primary no-loading" aria-label="Update order status" title="Update">
                                                <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
                                                <span class="sr-only">Update</span>
                                            </button>
                                        </form>
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

<script>
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.order-status-form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var orderId = form.dataset.orderId;
            var status = form.querySelector('select[name="status"]').value;

            fetchPost('<?= SITE_URL ?>/api/order_status.php', {
                order_id: orderId,
                status: status
            })
            .then(function(data) {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Updated',
                        text: 'Order status has been updated.',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(function() {
                        location.reload();
                    });
                } else {
                    throw new Error(data.message || 'Could not update order status.');
                }
            })
            .catch(function(error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Could not update order status.'
                });
            });
        });
    });
});
</script>

<?php require_once __DIR__ . "/../../includes/footer.php"; ?>
