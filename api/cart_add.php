<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Authentication required']);
    exit;
}

if ($_SESSION['role'] !== 'customer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Access denied']);
    exit;
}

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

$product_id = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
$quantity = isset($_POST['quantity']) ? max(1, (int)$_POST['quantity']) : 1;

if ($product_id <= 0) {
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Invalid product ID']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, stock, is_active FROM products WHERE id = ?');
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Product not found']);
        exit;
    }

    if (!$product['is_active']) {
        echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Product is not available']);
        exit;
    }

    if ($product['stock'] < $quantity) {
        echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Insufficient stock available']);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    $stmt = $pdo->prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?');
    $stmt->execute([$user_id, $product_id]);
    $existing_item = $stmt->fetch();

    if ($existing_item) {
        $new_quantity = $existing_item['quantity'] + $quantity;

        if ($new_quantity > $product['stock']) {
            echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Total quantity exceeds available stock']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
        $stmt->execute([$new_quantity, $existing_item['id']]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)');
        $stmt->execute([$user_id, $product_id, $quantity]);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM cart_items WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $cart_count = $stmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'cart_count' => (int)$cart_count,
        'message' => 'Item added to cart'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'cart_count' => 0, 'message' => 'Database error']);
}