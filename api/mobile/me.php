<?php
require_once __DIR__ . "/bootstrap.php";

mobile_method(["GET"]);

$user = mobile_user($pdo);
$user["id"] = (int) $user["id"];
$user["is_approved"] = (int) $user["is_approved"] === 1;
$user["profile_image_url"] = mobile_public_url($user["profile_image"] ?? null);

mobile_success(["user" => $user]);
