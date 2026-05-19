<?php

function env_value(string $key, $default = null)
{
    $value = getenv($key);

    if ($value === false && isset($_ENV[$key])) {
        $value = $_ENV[$key];
    }

    if ($value === false && isset($_SERVER[$key])) {
        $value = $_SERVER[$key];
    }

    return $value === false || $value === "" ? $default : $value;
}

function env_bool(string $key, bool $default = false): bool
{
    $value = env_value($key, null);

    if ($value === null) {
        return $default;
    }

    return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ??
        $default;
}

function app_is_https(): bool
{
    if (
        !empty($_SERVER["HTTPS"]) &&
        strtolower((string) $_SERVER["HTTPS"]) !== "off"
    ) {
        return true;
    }

    if (strtolower($_SERVER["HTTP_X_FORWARDED_PROTO"] ?? "") === "https") {
        return true;
    }

    if (strtolower($_SERVER["HTTP_X_FORWARDED_SSL"] ?? "") === "on") {
        return true;
    }

    return false;
}

function app_default_site_url(): string
{
    $host = $_SERVER["HTTP_HOST"] ?? "";

    if ($host === "") {
        return "http://localhost/ecommerce-ipt";
    }

    $scheme = app_is_https() ? "https" : "http";
    $script_name = str_replace("\\", "/", $_SERVER["SCRIPT_NAME"] ?? "");
    $base_path = rtrim(str_replace("\\", "/", dirname($script_name)), "/");

    foreach (["/pages/", "/api/"] as $public_dir) {
        $position = strpos($script_name, $public_dir);
        if ($position !== false) {
            $base_path = substr($script_name, 0, $position);
            break;
        }
    }

    if ($base_path === "/" || $base_path === ".") {
        $base_path = "";
    }

    return $scheme . "://" . $host . $base_path;
}

function app_default_db_port(): int
{
    $host = strtolower($_SERVER["HTTP_HOST"] ?? "");
    $host_without_port = preg_replace("/:\\d+$/", "", $host);
    $is_private_ipv4 =
        preg_match("/^10\\./", $host_without_port) ||
        preg_match("/^192\\.168\\./", $host_without_port) ||
        preg_match("/^172\\.(1[6-9]|2\\d|3[01])\\./", $host_without_port) ||
        preg_match("/^100\\.(6[4-9]|[7-9]\\d|1[01]\\d|12[0-7])\\./", $host_without_port);

    if (
        $host === "" ||
        $host === "localhost" ||
        str_starts_with($host, "localhost:") ||
        str_starts_with($host, "127.0.0.1") ||
        $is_private_ipv4
    ) {
        return 3307;
    }

    return 3306;
}

$app_env = strtolower((string) env_value("APP_ENV", "local"));
$is_https = app_is_https();
$secure_session_cookie = env_bool(
    "SESSION_COOKIE_SECURE",
    $app_env === "production" && $is_https,
);

session_start([
    "cookie_lifetime" => (int) env_value("SESSION_COOKIE_LIFETIME", 0),
    "cookie_path" => env_value("SESSION_COOKIE_PATH", "/"),
    "cookie_secure" => $secure_session_cookie,
    "cookie_httponly" => true,
    "cookie_samesite" => env_value("SESSION_COOKIE_SAMESITE", "Strict"),
    "use_strict_mode" => true,
]);

define("APP_ENV", $app_env);
define("APP_DEBUG", env_bool("APP_DEBUG", $app_env !== "production"));

define("DB_HOST", env_value("DB_HOST", "localhost"));
define("DB_PORT", (int) env_value("DB_PORT", app_default_db_port()));
define("DB_NAME", env_value("DB_NAME", "ecommerce_ipt"));
define("DB_USER", env_value("DB_USER", "root"));
define("DB_PASS", env_value("DB_PASS", ""));
define("DB_CHARSET", env_value("DB_CHARSET", "utf8mb4"));

define("SITE_NAME", env_value("SITE_NAME", "Shop"));
define(
    "SITE_URL",
    rtrim(env_value("SITE_URL", app_default_site_url()), "/"),
);

define(
    "UPLOAD_PATH",
    env_value("UPLOAD_PATH", dirname(__DIR__) . "/uploads/products/"),
);
define("UPLOAD_URL", env_value("UPLOAD_URL", "/uploads/products/"));

try {
    $dsn =
        "mysql:host=" .
        DB_HOST .
        ";port=" .
        DB_PORT .
        ";dbname=" .
        DB_NAME .
        ";charset=" .
        DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    if (APP_DEBUG) {
        die("Database connection failed: " . $e->getMessage());
    }

    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    die("A database connection error occurred. Please try again later.");
}
