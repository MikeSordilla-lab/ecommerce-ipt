<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

$is_ajax = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

function product_status_respond(bool $success, string $message, int $status = 200): void
{
    global $is_ajax;

    if ($is_ajax) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode(['success' => $success, 'message' => $message]);
        exit;
    }

    set_flash($success ? 'success' : 'error', $success ? 'Updated' : 'Error', $message);
    $redirect = SITE_URL;
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $site_host = parse_url(SITE_URL, PHP_URL_HOST);
    $ref_host = parse_url($referer, PHP_URL_HOST);
    if ($referer !== '' && $ref_host === $site_host) {
        $redirect = $referer;
    }
    redirect($redirect);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    product_status_respond(false, 'Method not allowed', 405);
}

$user_id = get_logged_in_user_id();
$role = get_user_role();

if (!$user_id || !in_array($role, ['admin', 'seller'], true)) {
    product_status_respond(false, 'Authentication required', 401);
}

if ($role === 'seller' && !check_approved_seller()) {
    product_status_respond(false, 'Seller approval required', 403);
}

if (!validate_csrf($_POST['csrf_token'] ?? '')) {
    product_status_respond(false, 'Invalid CSRF token', 403);
}

$product_id = isset($_POST['product_id']) ? (int) $_POST['product_id'] : 0;
$is_active = isset($_POST['is_active']) ? (int) $_POST['is_active'] : -1;

if ($product_id <= 0 || !in_array($is_active, [0, 1], true)) {
    product_status_respond(false, 'Invalid product request', 400);
}

try {
    $stmt = $pdo->prepare('SELECT id, seller_id FROM products WHERE id = ?');
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        product_status_respond(false, 'Product not found', 404);
    }

    if ($role === 'seller' && (int) $product['seller_id'] !== (int) $user_id) {
        product_status_respond(false, 'You do not have permission to update this product', 403);
    }

    $stmt = $pdo->prepare('UPDATE products SET is_active = ? WHERE id = ?');
    $stmt->execute([$is_active, $product_id]);

    product_status_respond(true, $is_active ? 'Product has been activated.' : 'Product has been deactivated.');
} catch (PDOException $e) {
    product_status_respond(false, 'Database error', 500);
}
