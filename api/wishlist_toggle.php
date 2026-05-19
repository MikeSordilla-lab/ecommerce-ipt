<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/modules/WishlistModule.php';

$is_ajax = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

function wishlist_respond(array $payload, int $status = 200): void
{
    global $is_ajax;

    if ($is_ajax) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($payload);
        exit;
    }

    set_flash($payload['success'] ? 'success' : 'error', $payload['success'] ? 'Wishlist Updated' : 'Wishlist Error', $payload['message']);
    $fallback = SITE_URL . '/pages/customer/wishlist.php';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    redirect($referer && strpos($referer, SITE_URL) === 0 ? $referer : $fallback);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    wishlist_respond(['success' => false, 'wishlisted' => false, 'message' => 'Method not allowed'], 405);
}

if (!validate_csrf($_POST['csrf_token'] ?? '')) {
    wishlist_respond(['success' => false, 'wishlisted' => false, 'message' => 'Invalid CSRF token'], 403);
}

if (!check_role('customer')) {
    wishlist_respond(['success' => false, 'wishlisted' => false, 'message' => 'Access denied'], 403);
}

$productId = (int) ($_POST['product_id'] ?? 0);
if ($productId <= 0) {
    wishlist_respond(['success' => false, 'wishlisted' => false, 'message' => 'Invalid product'], 400);
}

try {
    $wishlist = new WishlistModule();
    $result = $wishlist->toggle($pdo, (int) $_SESSION['user_id'], $productId);
    wishlist_respond($result, $result['success'] ? 200 : 400);
} catch (PDOException $e) {
    wishlist_respond(['success' => false, 'wishlisted' => false, 'message' => 'Database error'], 500);
}
