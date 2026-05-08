<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!validate_csrf($csrf_token)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
    exit;
}

$user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 0;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    exit;
}

if ($user_id === $_SESSION['user_id']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Cannot modify your own account']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, role FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    if (isset($_POST['role']) && $_POST['role'] !== '') {
        $new_role = $_POST['role'];
        $valid_roles = ['admin', 'seller', 'customer'];

        if (!in_array($new_role, $valid_roles)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid role']);
            exit;
        }

        $is_approved = ($new_role === 'seller') ? 0 : 1;

        $stmt = $pdo->prepare('UPDATE users SET role = ?, is_approved = ? WHERE id = ?');
        $stmt->execute([$new_role, $is_approved, $user_id]);

        echo json_encode(['success' => true, 'message' => 'User role updated']);
        exit;
    }

    if (isset($_POST['delete']) && $_POST['delete'] === '1') {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM orders WHERE user_id = ?');
        $stmt->execute([$user_id]);
        $order_count = $stmt->fetchColumn();

        if ($order_count > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cannot delete user with existing orders']);
            exit;
        }

        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$user_id]);

        echo json_encode(['success' => true, 'message' => 'User deleted']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No valid action specified']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}