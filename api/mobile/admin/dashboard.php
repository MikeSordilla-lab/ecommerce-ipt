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

    $ordersByStatus = $pdo->query(
        "SELECT status, COUNT(*) AS total
         FROM orders
         GROUP BY status"
    )->fetchAll(PDO::FETCH_ASSOC);

    $dailyOrders = $pdo->query(
        "SELECT DATE(created_at) AS order_date, COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS revenue
         FROM orders
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
         GROUP BY DATE(created_at)
         ORDER BY order_date"
    )->fetchAll(PDO::FETCH_ASSOC);

    $productsByCategory = $pdo->query(
        "SELECT c.name, COUNT(p.id) AS total
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
         GROUP BY c.id, c.name
         ORDER BY total DESC, c.name"
    )->fetchAll(PDO::FETCH_ASSOC);

    mobile_success([
        "stats" => $stats,
        "recent_orders" => array_map("mobile_order_row", $orders),
        "charts" => [
            "orders_by_status" => $ordersByStatus,
            "daily_orders" => $dailyOrders,
            "products_by_category" => $productsByCategory,
        ],
    ]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
