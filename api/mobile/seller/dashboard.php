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
        "SELECT COUNT(DISTINCT o.id)
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         WHERE p.seller_id = ? AND o.status = 'delivered'"
    );
    $stmt->execute([$sellerId]);
    $deliveredOrders = (int) $stmt->fetchColumn();

    $stmt = $pdo->prepare(
        "SELECT COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0)
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         WHERE p.seller_id = ? AND o.status = 'delivered'"
    );
    $stmt->execute([$sellerId]);
    $totalSales = (float) $stmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE seller_id = ? AND stock <= 5");
    $stmt->execute([$sellerId]);
    $lowStockCount = (int) $stmt->fetchColumn();

    $stmt = $pdo->prepare(
        "SELECT id, name, stock
         FROM products
         WHERE seller_id = ? AND stock <= 5
         ORDER BY stock ASC, name ASC"
    );
    $stmt->execute([$sellerId]);
    $lowStockProducts = array_map(fn($row) => [
        "id" => (int) $row["id"],
        "name" => $row["name"],
        "stock" => (int) $row["stock"],
    ], $stmt->fetchAll(PDO::FETCH_ASSOC));

    $stmt = $pdo->prepare(
        "SELECT DISTINCT o.*, u.username,
                (SELECT COALESCE(SUM(oi2.quantity * oi2.price_at_purchase), 0)
                 FROM order_items oi2
                 JOIN products p2 ON p2.id = oi2.product_id
                 WHERE oi2.order_id = o.id AND p2.seller_id = ?) AS seller_subtotal
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         JOIN users u ON u.id = o.user_id
         WHERE p.seller_id = ?
         ORDER BY o.created_at DESC
         LIMIT 10"
    );
    $stmt->execute([$sellerId, $sellerId]);
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
            "delivered_orders" => $deliveredOrders,
            "total_sales" => $totalSales,
            "low_stock_count" => $lowStockCount,
        ],
        "recent_orders" => $recentOrders,
        "low_stock_products" => $lowStockProducts,
        "charts" => [
            "daily_sales" => $dailySales,
            "top_products" => $topProducts,
            "stock_levels" => $stockLevels,
        ],
    ]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
