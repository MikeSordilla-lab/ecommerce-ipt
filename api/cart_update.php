<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

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

    $stmt = $pdo->prepare('
        SELECT ci.id, ci.quantity, p.stock, p.price, p.is_active
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.id = ? AND ci.user_id = ?
    ');
    $stmt->execute([$cart_item_id, $user_id]);
    $cart_item = $stmt->fetch();

    if (!$cart_item) {
        echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Cart item not found']);
        exit;
    }

    if (!$cart_item['is_active']) {
        echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Product is no longer available']);
        exit;
    }

    if ($quantity > $cart_item['stock']) {
        echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Quantity exceeds available stock']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
    $stmt->execute([$quantity, $cart_item_id]);

    $new_subtotal = (float)$cart_item['price'] * $quantity;

    echo json_encode([
        'success' => true,
        'new_subtotal' => round($new_subtotal, 2),
        'message' => 'Cart updated successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'new_subtotal' => 0, 'message' => 'Database error']);
}