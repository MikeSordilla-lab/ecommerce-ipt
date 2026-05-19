<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/modules/AddressModule.php";

mobile_method(["GET", "POST", "PATCH", "DELETE"]);

$user = mobile_require_role($pdo, ["customer"]);
$method = mobile_request_method();

try {
    if ($method === "GET") {
        $addresses = array_map(function ($address) {
            $address["id"] = (int) $address["id"];
            $address["user_id"] = (int) $address["user_id"];
            $address["is_default"] = (int) $address["is_default"] === 1;
            return $address;
        }, getAddressesByUser($pdo, (int) $user["id"]));
        mobile_success(["addresses" => $addresses]);
    }

    $body = mobile_body();

    if ($method === "POST") {
        $errors = validateAddressInput($body);
        if (!empty($errors)) {
            mobile_error("Please check the address fields", 422, ["errors" => $errors]);
        }

        $id = createAddress($pdo, (int) $user["id"], $body, !empty($body["is_default"]));
        mobile_success(["id" => $id], "Address saved");
    }

    $addressId = (int) ($body["address_id"] ?? $_GET["address_id"] ?? 0);
    if ($addressId <= 0) {
        mobile_error("Invalid address ID", 400);
    }

    if ($method === "PATCH") {
        setDefaultAddress($pdo, (int) $user["id"], $addressId);
        mobile_success(null, "Default address updated");
    }

    $deleted = deleteAddress($pdo, (int) $user["id"], $addressId);
    mobile_json(["success" => $deleted, "data" => null, "message" => $deleted ? "Address deleted" : "Address not found"], $deleted ? 200 : 404);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
