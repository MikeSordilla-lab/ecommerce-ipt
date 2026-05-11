<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/modules/CartModule.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Authentication required']);
    exit;
}

if ($_SESSION['role'] !== 'customer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Access denied']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Method not allowed']);
    exit;
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!validate_csrf($csrf_token)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Invalid CSRF token']);
    exit;
}

$cart_item_id = isset($_POST['cart_item_id']) ? (int)$_POST['cart_item_id'] : 0;
$quantity = isset($_POST['quantity']) ? (int)$_POST['quantity'] : 0;

if ($cart_item_id <= 0) {
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Invalid cart item ID']);
    exit;
}

if ($quantity <= 0) {
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Quantity must be at least 1']);
    exit;
}

try {
    $user_id = $_SESSION['user_id'];
    $cart = new CartModule();
    $result = $cart->updateItem($pdo, $user_id, $cart_item_id, $quantity);
    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Database error']);
}
