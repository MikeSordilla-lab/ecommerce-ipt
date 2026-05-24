<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/modules/ProductBrowsingModule.php";
require_once __DIR__ . "/../../includes/modules/WishlistModule.php";

mobile_method(["GET"]);

$id = (int) ($_GET["id"] ?? 0);
if ($id <= 0) {
    mobile_error("Invalid product ID", 400);
}

try {
    $user = mobile_user($pdo);
    $module = new ProductBrowsingModule();
    $product = $module->getProductById($pdo, $id);

    if (!$product || (int) $product["is_active"] !== 1) {
        mobile_error("Product not found", 404);
    }

    $wishlist = new WishlistModule();
    $wishlistedIds = $wishlist->getProductIds($pdo, (int) $user["id"]);
    $product = mobile_product_row($product);
    $product["wishlisted"] = in_array((int) $product["id"], $wishlistedIds, true);

    mobile_success(["product" => $product]);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
