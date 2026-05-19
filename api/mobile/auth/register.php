<?php
require_once __DIR__ . "/../bootstrap.php";
require_once __DIR__ . "/../../../includes/ValidationHelper.php";
require_once __DIR__ . "/../../../includes/MailHelper.php";

mobile_method(["POST"]);

$body = mobile_body();
$username = trim($body["username"] ?? "");
$email = trim($body["email"] ?? "");
$password = $body["password"] ?? "";
$role = $body["role"] ?? "customer";

if ($username === "" || strlen($username) < 3) {
    mobile_error("Username must be at least 3 characters", 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    mobile_error("A valid email is required", 422);
}

$passwordErrors = validate_password_strength($password);
if (!empty($passwordErrors)) {
    mobile_error("Please check your password", 422, ["errors" => $passwordErrors]);
}

if (!in_array($role, ["customer", "seller"], true)) {
    mobile_error("Mobile registration supports customer or seller accounts", 422);
}

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);

    if ((int) $stmt->fetchColumn() > 0) {
        mobile_error("Username or email is already in use", 422);
    }

    $isApproved = $role === "seller" ? 0 : 1;
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$username, $email, password_hash($password, PASSWORD_DEFAULT), $role, $isApproved]);
    $userId = (int) $pdo->lastInsertId();
    $token = create_email_verification($pdo, $userId);
    $emailSent = send_verification_email($email, $username, $token);

    if ($role === "seller") {
        mobile_success(["user_id" => $userId, "role" => $role, "email_sent" => $emailSent], "Seller account created. Verify your email, then wait for admin approval.");
    }

    mobile_success([
        "user_id" => $userId,
        "role" => $role,
        "email_sent" => $emailSent,
    ], "Registered. Please verify your email before logging in.");
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
