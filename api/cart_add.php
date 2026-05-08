<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/modules/CartModule.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Method not allowed']);
    exit;
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!validate_csrf($csrf_token)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Invalid CSRF token']);
    exit;
}

$user_id = get_logged_in_user_id();
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Authentication required']);
    exit;
}

if (!check_role('customer')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Access denied']);
    exit;
}

$product_id = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
$quantity = isset($_POST['quantity']) ? max(1, (int)$_POST['quantity']) : 1;

if ($product_id <= 0) {
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Invalid product ID']);
    exit;
}

try {
    $cart = new CartModule();
    $result = $cart->addItem($pdo, $user_id, $product_id, $quantity);
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Database error']);
}