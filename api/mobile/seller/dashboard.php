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
    $recentOrders = array_map("mobile_order_row", $stmt->fetchAll(PDO::FETCH_ASSOC));

    $stmt = $pdo->prepare(
        "SELECT DATE(o.created_at) AS order_date,
                COUNT(DISTINCT o.id) AS order_count,
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS revenue
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         WHERE p.seller_id = ?
           AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
         GROUP BY DATE(o.created_at)
         ORDER BY order_date"
    );
    $stmt->execute([$sellerId]);
    $dailySales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare(
        "SELECT p.name, COALESCE(SUM(oi.quantity), 0) AS units_sold
         FROM products p
         LEFT JOIN order_items oi ON oi.product_id = p.id
         WHERE p.seller_id = ?
         GROUP BY p.id, p.name
         ORDER BY units_sold DESC, p.name
         LIMIT 8"
    );
    $stmt->execute([$sellerId]);
    $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare(
        "SELECT name, stock
         FROM products
         WHERE seller_id = ?
         ORDER BY stock ASC, name ASC
         LIMIT 10"
    );
    $stmt->execute([$sellerId]);
    $stockLevels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    mobile_success([
        "stats" => [
            "products" => $products,
            "total_orders" => $totalOrders,
            "pending_orders" => $pendingOrders,
        ],
        "recent_orders" => $recentOrders,
        "charts" => [
            "daily_sales" => $dailySales,
            "top_products" => $topProducts,
            "stock_levels" => $stockLevels,
        ],
    ]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
