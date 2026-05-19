<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["GET"]);
$user = mobile_require_role($pdo, ["seller"]);

try {
    $sellerId = (int) $user["id"];

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE seller_id = ?");
    $stmt->execute([$sellerId]);
    $products = (int) $stmt->fetchColumn();

    $stmt = $pdo->prepare(
        "SELECT COUNT(DISTINCT o.id)
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         WHERE p.seller_id = ?"
    );
    $stmt->execute([$sellerId]);
    $totalOrders = (int) $stmt->fetchColumn();

    $stmt = $pdo->prepare(
        "SELECT COUNT(DISTINCT o.id)
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         WHERE p.seller_id = ? AND o.status = 'pending'"
    );
    $stmt->execute([$sellerId]);
    $pendingOrders = (int) $stmt->fetchColumn();

    $stmt = $pdo->prepare(
        "SELECT DISTINCT o.*, u.username
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         JOIN users u ON u.id = o.user_id
         WHERE p.seller_id = ?
         ORDER BY o.created_at DESC
         LIMIT 10"
    );
    $stmt->execute([$sellerId]);

    mobile_success([
        "stats" => [
            "products" => $products,
            "total_orders" => $totalOrders,
            "pending_orders" => $pendingOrders,
        ],
        "recent_orders" => array_map("mobile_order_row", $stmt->fetchAll(PDO::FETCH_ASSOC)),
    ]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
