<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/modules/WishlistModule.php";

mobile_method(["GET", "POST"]);

$user = mobile_require_role($pdo, ["customer"]);
$method = mobile_request_method();
$wishlist = new WishlistModule();

try {
    if ($method === "GET") {
        $items = array_map(function ($item) {
            $item["wishlist_id"] = (int) $item["wishlist_id"];
            return mobile_product_row($item);
        }, $wishlist->getItems($pdo, (int) $user["id"]));

        mobile_success([
            "items" => $items,
            "product_ids" => $wishlist->getProductIds($pdo, (int) $user["id"]),
        ]);
    }

    $body = mobile_body();
    $productId = (int) ($body["product_id"] ?? $_GET["product_id"] ?? 0);

    if ($productId <= 0) {
        mobile_error("Invalid product", 400);
    }

    $result = $wishlist->toggle($pdo, (int) $user["id"], $productId);
    mobile_json(["success" => (bool) $result["success"], "data" => $result, "message" => $result["message"]], $result["success"] ? 200 : 400);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
