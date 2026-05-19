<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["GET"]);
$user = mobile_require_role($pdo, ["seller"]);
$sellerId = (int) $user["id"];

try {
    $stmt = $pdo->prepare(
        "SELECT DISTINCT o.*, u.username
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         JOIN users u ON u.id = o.user_id
         WHERE p.seller_id = ?
         ORDER BY o.created_at DESC"
    );
    $stmt->execute([$sellerId]);
    $orders = array_map("mobile_order_row", $stmt->fetchAll(PDO::FETCH_ASSOC));

    mobile_success(["orders" => $orders]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
