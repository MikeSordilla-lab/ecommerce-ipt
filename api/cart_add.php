<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/modules/CartModule.php';

$is_ajax = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

function cart_add_redirect_url(): string {
    $fallback = SITE_URL . '/pages/customer/shop.php';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';

    if ($referer && strpos($referer, SITE_URL) === 0) {
        return $referer;
    }

    return $fallback;
}

function cart_add_respond(array $result, int $status = 200): void {
    global $is_ajax;

    if ($is_ajax) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($result);
        exit;
    }

    set_flash(
        $result['success'] ? 'success' : 'error',
        $result['success'] ? 'Successfully' : 'Could not add item',
        $result['message']
    );
    redirect(cart_add_redirect_url());
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cart_add_respond(['success' => false, 'cart_count' => 0, 'message' => 'Method not allowed'], 405);
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!validate_csrf($csrf_token)) {
    cart_add_respond(['success' => false, 'cart_count' => 0, 'message' => 'Invalid CSRF token'], 403);
}

$user_id = get_logged_in_user_id();
if (!$user_id) {
    cart_add_respond(['success' => false, 'cart_count' => 0, 'message' => 'Authentication required'], 401);
}

if (!check_role('customer')) {
    cart_add_respond(['success' => false, 'cart_count' => 0, 'message' => 'Access denied'], 403);
}

$product_id = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
$quantity = isset($_POST['quantity']) ? max(1, (int)$_POST['quantity']) : 1;

if ($product_id <= 0) {
    cart_add_respond(['success' => false, 'cart_count' => 0, 'message' => 'Invalid product ID'], 400);
}

try {
    $cart = new CartModule();
    $result = $cart->addItem($pdo, $user_id, $product_id, $quantity);
    cart_add_respond($result, $result['success'] ? 200 : 400);
} catch (PDOException $e) {
    cart_add_respond(['success' => false, 'cart_count' => 0, 'message' => 'Database error'], 500);
}
