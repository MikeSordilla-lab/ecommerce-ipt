<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/modules/CartModule.php";

mobile_method(["GET", "POST", "PATCH", "DELETE"]);

$user = mobile_require_role($pdo, ["customer"]);
$cart = new CartModule();
$method = mobile_request_method();

try {
    if ($method === "GET") {
        $items = $cart->getCart($pdo, (int) $user["id"]);
        $items = array_map(function ($item) {
            $item["cart_item_id"] = (int) $item["cart_item_id"];
            $item["product_id"] = (int) $item["product_id"];
            $item["price"] = (float) $item["price"];
            $item["stock"] = (int) $item["stock"];
            $item["quantity"] = (int) $item["quantity"];
            $item["subtotal"] = (float) $item["subtotal"];
            $item["image_url"] = mobile_public_url($item["image_path"] ?? null);
            return $item;
        }, $items);

        mobile_success([
            "items" => $items,
            "subtotal" => $cart->getCartSubtotal($items),
            "count" => $cart->getCartCount($pdo, (int) $user["id"]),
        ]);
    }

    $body = mobile_body();

    if ($method === "POST") {
        $result = $cart->addItem($pdo, (int) $user["id"], (int) ($body["product_id"] ?? 0), max(1, (int) ($body["quantity"] ?? 1)));
        mobile_json(["success" => (bool) $result["success"], "data" => $result, "message" => $result["message"]], $result["success"] ? 200 : 422);
    }

    if ($method === "PATCH") {
        $result = $cart->updateItem($pdo, (int) $user["id"], (int) ($body["cart_item_id"] ?? 0), (int) ($body["quantity"] ?? 0));
        mobile_json(["success" => (bool) $result["success"], "data" => $result, "message" => $result["message"]], $result["success"] ? 200 : 422);
    }

    $result = $cart->removeItem($pdo, (int) $user["id"], (int) ($body["cart_item_id"] ?? $_GET["cart_item_id"] ?? 0));
    mobile_json(["success" => (bool) $result["success"], "data" => $result, "message" => $result["message"]], $result["success"] ? 200 : 404);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
