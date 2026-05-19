<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["POST"]);

$body = mobile_body();
$username = trim($body["username"] ?? "");
$password = $body["password"] ?? "";

if ($username === "" || $password === "") {
    mobile_error("Username and password are required", 422);
}

try {
    $stmt = $pdo->prepare("SELECT id, username, email, password_hash, role, profile_image, is_approved, created_at FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user["password_hash"])) {
        mobile_error("Invalid username or password", 401);
    }

    if ($user["role"] === "seller" && (int) $user["is_approved"] !== 1) {
        mobile_error("Your seller account is pending admin approval", 403);
    }

    $token = mobile_create_token($pdo, (int) $user["id"]);
    unset($user["password_hash"]);
    $user["id"] = (int) $user["id"];
    $user["is_approved"] = (int) $user["is_approved"] === 1;
    $user["profile_image_url"] = mobile_public_url($user["profile_image"] ?? null);

    mobile_success(["token" => $token, "user" => $user], "Logged in");
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
