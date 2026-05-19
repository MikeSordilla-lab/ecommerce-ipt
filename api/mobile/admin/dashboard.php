<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["GET"]);
mobile_require_role($pdo, ["admin"]);

try {
    $stats = [
        "users" => (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
        "products" => (int) $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn(),
        "orders" => (int) $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
        "pending_sellers" => (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'seller' AND is_approved = 0")->fetchColumn(),
    ];

    $orders = $pdo->query(
        "SELECT o.*, u.username
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC
         LIMIT 10"
    )->fetchAll(PDO::FETCH_ASSOC);

    mobile_success(["stats" => $stats, "recent_orders" => array_map("mobile_order_row", $orders)]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
