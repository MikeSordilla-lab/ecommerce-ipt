<?php
require_once __DIR__ . "/bootstrap.php";

mobile_method(["GET"]);

$user = mobile_user($pdo);
$orderId = (int) ($_GET["id"] ?? 0);

if ($orderId <= 0) {
    mobile_error("Invalid order ID", 400);
}

try {
    $params = [$orderId];
    $where = "o.id = ?";

    if ($user["role"] === "customer") {
        $where .= " AND o.user_id = ?";
        $params[] = (int) $user["id"];
    } elseif ($user["role"] === "seller") {
        if ((int) $user["is_approved"] !== 1) {
            mobile_error("Seller approval required", 403);
        }
        $where .= " AND EXISTS (
            SELECT 1 FROM order_items soi
            JOIN products sp ON sp.id = soi.product_id
            WHERE soi.order_id = o.id AND sp.seller_id = ?
        )";
        $params[] = (int) $user["id"];
    } elseif ($user["role"] !== "admin") {
        mobile_error("Access denied", 403);
    }

    $stmt = $pdo->prepare("SELECT o.*, u.username FROM orders o JOIN users u ON u.id = o.user_id WHERE $where");
    $stmt->execute($params);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        mobile_error("Order not found", 404);
    }

    $itemSql = "SELECT oi.*, p.seller_id
                FROM order_items oi
                LEFT JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = ?";
    $itemParams = [$orderId];

    if ($user["role"] === "seller") {
        $itemSql .= " AND p.seller_id = ?";
        $itemParams[] = (int) $user["id"];
    }

    $itemSql .= " ORDER BY oi.id ASC";
    $stmt = $pdo->prepare($itemSql);
    $stmt->execute($itemParams);
    $items = array_map(function ($item) {
        $item["id"] = (int) $item["id"];
        $item["order_id"] = (int) $item["order_id"];
        $item["product_id"] = (int) $item["product_id"];
        $item["quantity"] = (int) $item["quantity"];
        $item["price_at_purchase"] = (float) $item["price_at_purchase"];
        return $item;
    }, $stmt->fetchAll(PDO::FETCH_ASSOC));

    mobile_success(["order" => mobile_order_row($order), "items" => $items]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
