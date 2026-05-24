<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/ValidationHelper.php";

mobile_method(["POST", "PATCH"]);

$user = mobile_user($pdo);
$body = mobile_body();

$currentPassword = (string) ($body["current_password"] ?? "");
$newPassword = (string) ($body["new_password"] ?? "");
$confirmPassword = (string) ($body["confirm_password"] ?? "");

if ($currentPassword === "" || $newPassword === "" || $confirmPassword === "") {
    mobile_error("Complete all password fields", 400);
}

if ($newPassword !== $confirmPassword) {
    mobile_error("Passwords do not match", 400);
}

$passwordErrors = validate_password_strength($newPassword);
if (!empty($passwordErrors)) {
    mobile_error(implode(" ", $passwordErrors), 400);
}

try {
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([(int) $user["id"]]);
    $hash = $stmt->fetchColumn();

    if (!$hash || !password_verify($currentPassword, $hash)) {
        mobile_error("Current password is incorrect", 400);
    }

    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), (int) $user["id"]]);

    mobile_success(null, "Password updated");
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
