<?php
require_once __DIR__ . "/../bootstrap.php";
require_once __DIR__ . "/../../../includes/ImageHelper.php";
require_once __DIR__ . "/../../../includes/ProductValidationHelper.php";

mobile_method(["GET", "PATCH", "DELETE", "POST"]);
mobile_require_role($pdo, ["admin"]);
$method = mobile_request_method();

function admin_categories(PDO $pdo): array
{
    return array_map(fn($category) => [
        "id" => (int) $category["id"],
        "name" => $category["name"],
    ], $pdo->query("SELECT id, name FROM categories ORDER BY name")->fetchAll(PDO::FETCH_ASSOC));
}

try {
    if ($method === "GET") {
        $stmt = $pdo->query(
            "SELECT p.*, c.name AS category_name, u.username AS seller_name
             FROM products p
             JOIN categories c ON c.id = p.category_id
             LEFT JOIN users u ON u.id = p.seller_id
             ORDER BY p.created_at DESC"
        );
        mobile_success([
            "products" => array_map("mobile_product_row", $stmt->fetchAll(PDO::FETCH_ASSOC)),
            "categories" => admin_categories($pdo),
        ]);
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

    if ($method === "POST") {
        $categoryId = (int) ($body["category_id"] ?? 0);
        $name = trim($body["name"] ?? "");
        $description = trim($body["description"] ?? "");
        $price = (float) ($body["price"] ?? 0);
        $stock = (int) ($body["stock"] ?? 0);
        $isActive = array_key_exists("is_active", $body) ? ((string) $body["is_active"] === "1" || $body["is_active"] === true ? 1 : 0) : 1;
        $errors = validate_product_fields($categoryId, $name, $price, $stock);

        if (!empty($errors)) {
            mobile_error("Please check the product fields", 422, ["errors" => $errors]);
        }

        $stmt = $pdo->prepare("SELECT image_path FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            mobile_error("Product not found", 404);
        }

        $imagePath = $existing["image_path"] ?? null;
        if (isset($_FILES["image"]) && ($_FILES["image"]["error"] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $upload = ImageHelper::moveUploadedImage($_FILES["image"], UPLOAD_PATH, UPLOAD_URL, "product_{$productId}");
            if (!$upload["success"]) {
                mobile_error($upload["message"], 422);
            }
            $imagePath = $upload["url"];
        }

        $stmt = $pdo->prepare(
            "UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_path = ?, is_active = ? WHERE id = ?"
        );
        $stmt->execute([$categoryId, $name, $description, $price, $stock, $imagePath, $isActive, $productId]);
        mobile_success(["id" => $productId], "Product updated");
    }

    if ($method === "PATCH" && array_key_exists("is_active", $body)) {
        $active = ((string) $body["is_active"] === "1" || $body["is_active"] === true) ? 1 : 0;
        $stmt = $pdo->prepare("UPDATE products SET is_active = ? WHERE id = ?");
        $stmt->execute([$active, $productId]);
        mobile_success(null, $active ? "Product activated" : "Product deactivated");
    }

    mobile_error("No valid action specified", 400);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
