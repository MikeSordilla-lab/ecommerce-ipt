<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/modules/ProductBrowsingModule.php";

mobile_method(["GET"]);

$page = max(1, (int) ($_GET["page"] ?? 1));
$perPage = min(50, max(1, (int) ($_GET["per_page"] ?? 12)));
$filters = [];

if (!empty($_GET["category_id"])) {
    $filters["category_id"] = (int) $_GET["category_id"];
}

if (!empty($_GET["search"])) {
    $filters["search"] = trim($_GET["search"]);
}

if (!empty($_GET["price_range"])) {
    $filters["price_range"] = $_GET["price_range"];
}

try {
    $categories = $pdo->query("SELECT id, name FROM categories ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
    $module = new ProductBrowsingModule();
    $result = $module->getProducts($pdo, $filters, $page, $perPage);
    $result["products"] = array_map("mobile_product_row", $result["products"]);
    $result["categories"] = array_map(fn($category) => [
        "id" => (int) $category["id"],
        "name" => $category["name"],
    ], $categories);

    mobile_success($result);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
