<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["GET", "PATCH", "DELETE", "POST"]);
$admin = mobile_require_role($pdo, ["admin"]);
$method = mobile_request_method();

try {
    if ($method === "GET") {
        $users = array_map(function ($user) {
            $user["id"] = (int) $user["id"];
            $user["is_approved"] = (int) $user["is_approved"] === 1;
            $user["profile_image_url"] = mobile_public_url($user["profile_image"] ?? null);
            unset($user["password_hash"]);
            return $user;
        }, $pdo->query("SELECT id, username, email, role, profile_image, is_approved, created_at FROM users ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC));

        mobile_success(["users" => $users]);
    }

    $body = mobile_body();
    $userId = (int) ($body["user_id"] ?? $_GET["user_id"] ?? 0);

    if ($userId <= 0) {
        mobile_error("Invalid user ID", 400);
    }
    if ($userId === (int) $admin["id"]) {
        mobile_error("Cannot modify your own account", 422);
    }

    $stmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        mobile_error("User not found", 404);
    }

    if ($method === "DELETE") {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE user_id = ?");
        $stmt->execute([$userId]);
        if ((int) $stmt->fetchColumn() > 0) {
            mobile_error("Cannot delete user with existing orders", 422);
        }
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        mobile_success(null, "User deleted");
    }

    if (!empty($body["approve"])) {
        if ($user["role"] !== "seller") {
            mobile_error("Only seller accounts can be approved", 422);
        }
        $stmt = $pdo->prepare("UPDATE users SET is_approved = 1 WHERE id = ? AND role = 'seller'");
        $stmt->execute([$userId]);
        mobile_success(null, "Seller approved");
    }

    if (!empty($body["role"])) {
        $role = $body["role"];
        if (!in_array($role, ["admin", "seller", "customer"], true)) {
            mobile_error("Invalid role", 422);
        }
        $isApproved = $role === "seller" ? 0 : 1;
        $stmt = $pdo->prepare("UPDATE users SET role = ?, is_approved = ? WHERE id = ?");
        $stmt->execute([$role, $isApproved, $userId]);
        mobile_success(null, "User role updated");
    }

    mobile_error("No valid action specified", 400);
} catch (PDOException $e) {
    mobile_error("Database error", 500);
}
