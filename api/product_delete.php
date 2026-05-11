<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

$is_ajax = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

function product_delete_respond(bool $success, string $message, int $status = 200): void
{
    global $is_ajax;

    if ($is_ajax) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode(['success' => $success, 'message' => $message]);
        exit;
    }

    set_flash($success ? 'success' : 'error', $success ? 'Deleted' : 'Error', $message);
    $redirect = $_SERVER['HTTP_REFERER'] ?? SITE_URL;
    if (strpos($redirect, SITE_URL) !== 0) {
        $redirect = SITE_URL;
    }
    redirect($redirect);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    product_delete_respond(false, 'Method not allowed', 405);
}

$user_id = get_logged_in_user_id();
$role = get_user_role();

if (!$user_id || !in_array($role, ['admin', 'seller'], true)) {
    product_delete_respond(false, 'Authentication required', 401);
}

if ($role === 'seller' && !check_approved_seller()) {
    product_delete_respond(false, 'Seller approval required', 403);
}

if (!validate_csrf($_POST['csrf_token'] ?? '')) {
    product_delete_respond(false, 'Invalid CSRF token', 403);
}

$product_id = isset($_POST['product_id']) ? (int) $_POST['product_id'] : 0;

if ($product_id <= 0) {
    product_delete_respond(false, 'Invalid product ID', 400);
}

try {
    $stmt = $pdo->prepare('SELECT id, seller_id FROM products WHERE id = ?');
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        product_delete_respond(false, 'Product not found', 404);
    }

    if ($role === 'seller' && (int) $product['seller_id'] !== (int) $user_id) {
        product_delete_respond(false, 'You do not have permission to delete this product', 403);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM order_items WHERE product_id = ?');
    $stmt->execute([$product_id]);
    $order_count = (int) $stmt->fetchColumn();

    if ($order_count > 0) {
        product_delete_respond(false, 'This product has order history. Deactivate it instead of deleting it.', 400);
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE product_id = ?');
    $stmt->execute([$product_id]);

    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$product_id]);

    $pdo->commit();

    product_delete_respond(true, 'Product has been deleted.');
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    product_delete_respond(false, 'Database error', 500);
}
