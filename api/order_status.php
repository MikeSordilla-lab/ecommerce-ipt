<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/modules/OrderStatusModule.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'seller'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

if ($_SESSION['role'] === 'seller' && !check_approved_seller()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Seller approval required']);
    exit;
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!validate_csrf($csrf_token)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
    exit;
}

$order_id = isset($_POST['order_id']) ? (int)$_POST['order_id'] : 0;
$new_status = $_POST['status'] ?? '';

if ($order_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid order ID']);
    exit;
}

if (!OrderStatusModule::isValid($new_status)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status value']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT status FROM orders WHERE id = ?');
    $stmt->execute([$order_id]);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }

    if (!OrderStatusModule::canTransition($order['status'], $new_status)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid status transition']);
        exit;
    }

    if ($_SESSION['role'] === 'seller') {
        $stmt = $pdo->prepare('
            SELECT COUNT(*) FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ? AND p.seller_id = ?
        ');
        $stmt->execute([$order_id, $_SESSION['user_id']]);
        $hasProducts = (int)$stmt->fetchColumn();

        if ($hasProducts === 0) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You do not have permission to update this order']);
            exit;
        }
    }

    $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->execute([$new_status, $order_id]);

    echo json_encode(['success' => true, 'message' => 'Order status updated']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
