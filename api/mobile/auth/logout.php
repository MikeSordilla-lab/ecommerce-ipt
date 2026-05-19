<?php
require_once __DIR__ . "/../bootstrap.php";

mobile_method(["POST"]);

$token = mobile_bearer_token();
if ($token) {
    mobile_ensure_tokens_table($pdo);
    $stmt = $pdo->prepare("DELETE FROM mobile_tokens WHERE token_hash = ?");
    $stmt->execute([hash("sha256", $token)]);
}

mobile_success(null, "Logged out");
