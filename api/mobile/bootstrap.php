<?php
require_once __DIR__ . "/../../includes/config.php";
require_once __DIR__ . "/../../includes/functions.php";
require_once __DIR__ . "/../../includes/auth.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit();
}

function mobile_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit();
}

function mobile_success($data = null, string $message = ""): void
{
    mobile_json(["success" => true, "data" => $data, "message" => $message]);
}

function mobile_error(string $message, int $status = 400, $data = null): void
{
    mobile_json(["success" => false, "data" => $data, "message" => $message], $status);
}

function mobile_method(array $methods): void
{
    $method = $_SERVER["REQUEST_METHOD"] ?? "GET";
    $override = $_POST["_method"] ?? $_GET["_method"] ?? "";

    if ($method === "POST" && $override !== "") {
        $method = strtoupper($override);
    }

    if (!in_array($method, $methods, true)) {
        mobile_error("Method not allowed", 405);
    }
}

function mobile_request_method(): string
{
    $method = $_SERVER["REQUEST_METHOD"] ?? "GET";
    $override = $_POST["_method"] ?? $_GET["_method"] ?? "";
    return $method === "POST" && $override !== "" ? strtoupper($override) : $method;
}

function mobile_body(): array
{
    $contentType = strtolower($_SERVER["CONTENT_TYPE"] ?? "");

    if (str_contains($contentType, "application/json")) {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw ?: "{}", true);
        return is_array($data) ? $data : [];
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    parse_str(file_get_contents("php://input") ?: "", $data);
    return is_array($data) ? $data : [];
}

function mobile_ensure_tokens_table(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS mobile_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash CHAR(64) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_mobile_tokens_user (user_id),
            INDEX idx_mobile_tokens_expires (expires_at)
        )"
    );
}

function mobile_create_token(PDO $pdo, int $userId): string
{
    mobile_ensure_tokens_table($pdo);
    $token = bin2hex(random_bytes(32));
    $hash = hash("sha256", $token);
    $stmt = $pdo->prepare("INSERT INTO mobile_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))");
    $stmt->execute([$userId, $hash]);
    return $token;
}

function mobile_bearer_token(): ?string
{
    $header = $_SERVER["HTTP_AUTHORIZATION"] ?? $_SERVER["REDIRECT_HTTP_AUTHORIZATION"] ?? "";

    if ($header === "" && function_exists("apache_request_headers")) {
        $headers = apache_request_headers();
        $header = $headers["Authorization"] ?? $headers["authorization"] ?? "";
    }

    if (preg_match("/Bearer\s+(.+)/i", $header, $matches)) {
        return trim($matches[1]);
    }

    return null;
}

function mobile_user(PDO $pdo): array
{
    mobile_ensure_tokens_table($pdo);
    $token = mobile_bearer_token();

    if (!$token) {
        mobile_error("Authentication required", 401);
    }

    $stmt = $pdo->prepare(
        "SELECT u.id, u.username, u.email, u.role, u.profile_image, u.is_approved, u.email_verified_at, u.created_at
         FROM mobile_tokens mt
         JOIN users u ON u.id = mt.user_id
         WHERE mt.token_hash = ? AND mt.expires_at > NOW()"
    );
    $stmt->execute([hash("sha256", $token)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        mobile_error("Invalid or expired token", 401);
    }

    if (empty($user["email_verified_at"])) {
        mobile_error("Please verify your email address", 403);
    }

    $_SESSION["user_id"] = (int) $user["id"];
    $_SESSION["username"] = $user["username"];
    $_SESSION["role"] = $user["role"];

    return $user;
}

function mobile_require_role(PDO $pdo, array $roles): array
{
    $user = mobile_user($pdo);

    if (!in_array($user["role"], $roles, true)) {
        mobile_error("Access denied", 403);
    }

    if ($user["role"] === "seller" && (int) $user["is_approved"] !== 1) {
        mobile_error("Seller approval required", 403);
    }

    return $user;
}

function mobile_public_url(?string $path): ?string
{
    if (!$path) {
        return null;
    }

    return asset_url($path);
}

function mobile_order_row(array $order): array
{
    $order["id"] = (int) $order["id"];
    $order["user_id"] = (int) $order["user_id"];
    $order["total"] = (float) $order["total"];
    $order["shipping_address"] = json_decode($order["shipping_address"] ?? "{}", true) ?: [];
    $order["payment_label"] = get_payment_method_label($order["payment_method"] ?? "COD");
    $order["payment_status_label"] = get_payment_status_label($order["payment_method"] ?? "COD", $order["status"] ?? "pending");
    return $order;
}

function mobile_product_row(array $product): array
{
    $product["id"] = (int) $product["id"];
    $product["category_id"] = (int) $product["category_id"];
    $product["seller_id"] = isset($product["seller_id"]) ? (int) $product["seller_id"] : null;
    $product["price"] = (float) $product["price"];
    $product["stock"] = (int) $product["stock"];
    $product["is_active"] = (int) $product["is_active"] === 1;
    $product["image_url"] = mobile_public_url($product["image_path"] ?? null);
    return $product;
}
