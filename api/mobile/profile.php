<?php
require_once __DIR__ . "/bootstrap.php";
require_once __DIR__ . "/../../includes/ValidationHelper.php";
require_once __DIR__ . "/../../includes/ProfileUpdateHelper.php";
require_once __DIR__ . "/../../includes/ImageHelper.php";

mobile_method(["POST", "PATCH"]);

$user = mobile_user($pdo);
$method = mobile_request_method();

function mobile_profile_payload(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare("SELECT id, username, email, role, profile_image, is_approved, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $nextUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$nextUser) {
        mobile_error("User not found", 404);
    }

    $nextUser["id"] = (int) $nextUser["id"];
    $nextUser["is_approved"] = (int) $nextUser["is_approved"] === 1;
    $nextUser["profile_image_url"] = mobile_public_url($nextUser["profile_image"] ?? null);

    return $nextUser;
}

if ($method === "POST") {
    if (!isset($_FILES["profile_image"]) || $_FILES["profile_image"]["error"] !== UPLOAD_ERR_OK) {
        mobile_error("No file uploaded", 400);
    }

    $upload = ImageHelper::moveUploadedImage(
        $_FILES["profile_image"],
        __DIR__ . "/../../uploads/profiles/",
        "/uploads/profiles/",
        "user_" . (int) $user["id"]
    );

    if (!$upload["success"]) {
        $status = in_array($upload["message"], ["Failed to prepare upload directory", "Failed to save file"], true) ? 500 : 400;
        mobile_error($upload["message"], $status);
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
        $stmt->execute([$upload["url"], (int) $user["id"]]);
        mobile_success(["user" => mobile_profile_payload($pdo, (int) $user["id"])], "Profile image updated");
    } catch (PDOException $e) {
        if (is_file($upload["path"])) {
            unlink($upload["path"]);
        }
        mobile_error("Database error", 500);
    }
}

$body = mobile_body();
$username = trim((string) ($body["username"] ?? $user["username"] ?? ""));
$email = trim((string) ($body["email"] ?? $user["email"] ?? ""));
$currentPassword = (string) ($body["current_password"] ?? "");
$newPassword = (string) ($body["new_password"] ?? "");
$confirmPassword = (string) ($body["confirm_password"] ?? "");
$passwordChangeRequested = $currentPassword !== "" || $newPassword !== "" || $confirmPassword !== "";

$identityErrors = validate_profile_identity($username, $email);
if (!empty($identityErrors)) {
    mobile_error(implode(" ", $identityErrors), 400);
}

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
    $stmt->execute([$username, (int) $user["id"]]);
    if ((int) $stmt->fetchColumn() > 0) {
        mobile_error("This username is already taken.", 400);
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, (int) $user["id"]]);
    if ((int) $stmt->fetchColumn() > 0) {
        mobile_error("This email is already in use.", 400);
    }

    if ($passwordChangeRequested) {
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

        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([(int) $user["id"]]);
        $hash = $stmt->fetchColumn();

        if (!$hash || !password_verify($currentPassword, $hash)) {
            mobile_error("Current password is incorrect", 400);
        }

        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?");
        $stmt->execute([$username, $email, password_hash($newPassword, PASSWORD_DEFAULT), (int) $user["id"]]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
        $stmt->execute([$username, $email, (int) $user["id"]]);
    }

    $_SESSION["username"] = $username;
    mobile_success(["user" => mobile_profile_payload($pdo, (int) $user["id"])], "Profile updated");
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
