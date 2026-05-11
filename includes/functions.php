<?php

function set_flash($type, $title, $message)
{
    $_SESSION["flash"] = [
        "type" => $type,
        "title" => $title,
        "message" => $message,
    ];
}

function add_flash($type, $title, $message)
{
    if (!isset($_SESSION["flashes"]) || !is_array($_SESSION["flashes"])) {
        $_SESSION["flashes"] = [];
    }

    $_SESSION["flashes"][] = [
        "type" => $type,
        "title" => $title,
        "message" => $message,
    ];
}

function get_payment_status_label($payment_method, $order_status = "pending")
{
    $payment_method = strtoupper(trim($payment_method ?? ""));
    $order_status = strtolower(trim($order_status ?? "pending"));

    if ($payment_method === "COD") {
        return $order_status === "delivered"
            ? "Payment Collected"
            : "To Pay on Delivery";
    }

    return "Pending";
}

function get_payment_method_label($payment_method)
{
    return strtoupper(trim($payment_method ?? "")) === "COD"
        ? "Cash on Delivery"
        : ($payment_method ?:
            "Pending");
}

function redirect($url)
{
    if (strpos($url, "/") === 0) {
        $url = rtrim(SITE_URL, "/") . $url;
    }
    header("Location: " . $url);
    exit();
}

function sanitize($input)
{
    return htmlspecialchars($input ?? "", ENT_QUOTES, "UTF-8");
}

function format_currency($amount)
{
    return "₱" . number_format((float) $amount, 2);
}

function asset_url($path)
{
    if (empty($path)) {
        return "";
    }

    if (preg_match("#^(https?:)?//#", $path) || strpos($path, "data:") === 0) {
        return $path;
    }

    if (defined("SITE_URL") && strpos($path, SITE_URL) === 0) {
        return $path;
    }

    if (strpos($path, "/") === 0) {
        return rtrim(SITE_URL, "/") . $path;
    }

    return rtrim(SITE_URL, "/") . "/" . $path;
}

function is_logged_in()
{
    return isset($_SESSION["user_id"]);
}

function get_user_role()
{
    return $_SESSION["role"] ?? null;
}

function get_logged_in_user_id()
{
    return $_SESSION["user_id"] ?? null;
}

function get_logged_in_username()
{
    return $_SESSION["username"] ?? null;
}

function generate_csrf()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION["csrf_token"])) {
        $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
    }
    return $_SESSION["csrf_token"];
}

function validate_csrf($token)
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION["csrf_token"]) &&
        hash_equals($_SESSION["csrf_token"], $token ?? "");
}

function csrf_field()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION["csrf_token"])) {
        $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
    }
    return '<input type="hidden" name="csrf_token" value="' .
        htmlspecialchars($_SESSION["csrf_token"], ENT_QUOTES, "UTF-8") .
        '">';
}
