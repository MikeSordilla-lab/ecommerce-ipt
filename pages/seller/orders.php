<?php
$page_title = "Order Management";
require_once __DIR__ . "/../../includes/config.php";
require_once __DIR__ . "/../../includes/functions.php";
require_once __DIR__ . "/../../includes/auth.php";
require_once __DIR__ . "/../../includes/modules/OrderStatusModule.php";

require_approved_seller();

$seller_id = $_SESSION["user_id"];

try {
    $stmt = $pdo->prepare('
        SELECT DISTINCT o.*, u.username
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.user_id = u.id
        WHERE oi.product_id IN (SELECT id FROM products WHERE seller_id = ?)
        ORDER BY o.created_at DESC
    ');
    $stmt->execute([$seller_id]);
    $orders = $stmt->fetchAll();

    $order_items = [];
    if (!empty($orders)) {
        $order_ids = array_column($orders, "id");
        $placeholders = implode(",", array_fill(0, count($order_ids), "?"));
        $item_stmt = $pdo->prepare("
            SELECT oi.order_id, oi.product_name, oi.quantity, oi.price_at_purchase
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE p.seller_id = ? AND oi.order_id IN ($placeholders)
            ORDER BY oi.id ASC
        ");
        $item_stmt->execute(array_merge([$seller_id], $order_ids));

        foreach ($item_stmt->fetchAll() as $item) {
            $order_items[$item["order_id"]][] = $item;
        }

        foreach ($orders as &$order) {
            $items = $order_items[$order["id"]] ?? [];
            $order["seller_subtotal"] = array_sum(array_map(
                fn($i) => (float) $i["price_at_purchase"] * (int) $i["quantity"],
                $items
            ));
        }
        unset($order);
    }
} catch (PDOException $e) {
    $orders = [];
    $order_items = [];
}

generate_csrf();
require_once __DIR__ . "/../../includes/header.php";
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">Order Management</h1>

    <?php if (empty($orders)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-box-seam"></i></div>
            <h2 class="empty-state-title">No orders for your products yet</h2>
            <p class="empty-state-text">When customers order your products, they'll appear here.</p>
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
                                <th>Your Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Payment Status</th>
                                <th>Status</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($orders as $order): ?>
                                <?php $items =
                                    $order_items[$order["id"]] ?? []; ?>
                                <tr>
                                    <td>#<?= $order["id"] ?></td>
                                    <td><?= sanitize($order["username"]) ?></td>
                                    <td>
                                        <?php if (empty($items)): ?>
                                            <span class="text-body small">No seller items found</span>
                                        <?php else: ?>
                                            <div class="d-flex flex-column gap-1">
                                                <?php foreach (
                                                    $items
                                                    as $item
                                                ): ?>
                                                    <div class="small">
                                                        <span class="text-heading"><?= sanitize(
                                                            $item[
                                                                "product_name"
                                                            ],
                                                        ) ?></span>
                                                        <span class="text-body">
                                                            x<?= (int) $item[
                                                                "quantity"
                                                            ] ?> · <?= format_currency(
     $item["price_at_purchase"],
 ) ?>
                                                        </span>
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= format_currency(
                                        $order["seller_subtotal"],
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
                                        strtotime($order["updated_at"]),
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
