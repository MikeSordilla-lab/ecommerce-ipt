<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/modules/CartModule.php";
require_once __DIR__ . "/../../includes/modules/OrderPlacementModule.php";
require_once __DIR__ . "/../../includes/modules/AddressModule.php";

mobile_method(["GET", "POST"]);

$user = mobile_require_role($pdo, ["customer"]);
$method = mobile_request_method();

try {
    if ($method === "GET") {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([(int) $user["id"]]);
        $orders = array_map("mobile_order_row", $stmt->fetchAll(PDO::FETCH_ASSOC));
        mobile_success(["orders" => $orders]);
    }

    $body = mobile_body();
    $cart = new CartModule();
    $cartItems = $cart->getCart($pdo, (int) $user["id"]);

    if (empty($cartItems)) {
        mobile_error("Your cart is empty", 422);
    }

    if (!empty($body["address_id"])) {
        $stmt = $pdo->prepare("SELECT full_name, phone, address FROM addresses WHERE id = ? AND user_id = ?");
        $stmt->execute([(int) $body["address_id"], (int) $user["id"]]);
        $shippingAddress = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$shippingAddress) {
            mobile_error("Address not found", 404);
        }
    } else {
        $shippingAddress = [
            "full_name" => trim($body["full_name"] ?? ""),
            "phone" => trim($body["phone"] ?? ""),
            "address" => trim($body["address"] ?? ""),
        ];
    }

    $errors = validateAddressInput($shippingAddress);
    $orderPlacement = new OrderPlacementModule();
    $stockValidation = $orderPlacement->validateStockAvailability($pdo, $cartItems);
    $errors = array_merge($errors, $stockValidation["errors"]);

    if (!empty($errors)) {
        mobile_error("Could not place order", 422, ["errors" => $errors]);
    }

    $shippingAddress["phone"] = normalize_ph_mobile($shippingAddress["phone"] ?? "") ?? ($shippingAddress["phone"] ?? "");

    $orderItems = array_map(fn($item) => [
        "product_id" => (int) $item["product_id"],
        "name" => $item["name"],
        "price" => (float) $item["price"],
        "quantity" => (int) $item["quantity"],
    ], $cartItems);

    $result = $orderPlacement->placeOrder(
        $pdo,
        (int) $user["id"],
        $orderItems,
        $shippingAddress,
        trim($body["notes"] ?? ""),
        "COD"
    );

    if (!empty($body["save_address"])) {
        createAddress($pdo, (int) $user["id"], $shippingAddress, false);
    }

    mobile_json(["success" => (bool) $result["success"], "data" => $result, "message" => $result["message"]], $result["success"] ? 200 : 422);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
