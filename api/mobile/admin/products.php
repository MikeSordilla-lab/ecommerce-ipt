<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["GET", "PATCH", "DELETE", "POST"]);
mobile_require_role($pdo, ["admin"]);
$method = mobile_request_method();

try {
    if ($method === "GET") {
        $stmt = $pdo->query(
            "SELECT p.*, c.name AS category_name, u.username AS seller_name
             FROM products p
             JOIN categories c ON c.id = p.category_id
             LEFT JOIN users u ON u.id = p.seller_id
             ORDER BY p.created_at DESC"
        );
        mobile_success(["products" => array_map("mobile_product_row", $stmt->fetchAll(PDO::FETCH_ASSOC))]);
    }

    $body = mobile_body();
    $productId = (int) ($body["product_id"] ?? $_GET["product_id"] ?? 0);
    if ($productId <= 0) {
        mobile_error("Invalid product ID", 400);
    }

    if ($method === "DELETE") {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM order_items WHERE product_id = ?");
        $stmt->execute([$productId]);
        if ((int) $stmt->fetchColumn() > 0) {
            $stmt = $pdo->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
            $stmt->execute([$productId]);
            mobile_success(null, "Product has order history and was deactivated");
        }
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        mobile_json(["success" => $stmt->rowCount() > 0, "data" => null, "message" => $stmt->rowCount() > 0 ? "Product deleted" : "Product not found"], $stmt->rowCount() > 0 ? 200 : 404);
    }

    if (array_key_exists("is_active", $body)) {
        $active = ((string) $body["is_active"] === "1" || $body["is_active"] === true) ? 1 : 0;
        $stmt = $pdo->prepare("UPDATE products SET is_active = ? WHERE id = ?");
        $stmt->execute([$active, $productId]);
        mobile_success(null, $active ? "Product activated" : "Product deactivated");
    }

    mobile_error("No valid action specified", 400);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
