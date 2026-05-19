<?php
require_once __DIR__ . "/bootstrap.php";

mobile_method(["GET"]);

mobile_success([
    "status" => "ok",
    "app" => SITE_NAME,
    "environment" => APP_ENV,
    "site_url" => SITE_URL,
    "server_time" => gmdate("c"),
]);
