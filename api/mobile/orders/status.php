<?php
require_once __DIR__ . "/../bootstrap.php";
require_once __DIR__ . "/../../../includes/modules/OrderStatusModule.php";

mobile_method(["PATCH", "POST"]);

$user = mobile_require_role($pdo, ["admin", "seller"]);
$body = mobile_body();
$orderId = (int) ($body["order_id"] ?? 0);
$newStatus = trim($body["status"] ?? "");

if ($orderId <= 0) {
    mobile_error("Invalid order ID", 400);
}

if (!OrderStatusModule::isValid($newStatus)) {
    mobile_error("Invalid status value", 422);
}

try {
    $stmt = $pdo->prepare("SELECT status FROM orders WHERE id = ?");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        mobile_error("Order not found", 404);
    }

    if (!OrderStatusModule::canTransition($order["status"], $newStatus)) {
        mobile_error("Invalid status transition", 422);
    }

    if ($user["role"] === "seller") {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ? AND p.seller_id = ?"
        );
        $stmt->execute([$orderId, (int) $user["id"]]);

        if ((int) $stmt->fetchColumn() === 0) {
            mobile_error("You do not have permission to update this order", 403);
        }
    }

    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$newStatus, $orderId]);
    mobile_success(null, "Order status updated");
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
