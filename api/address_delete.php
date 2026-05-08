<?php
session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true
]);

header('Content-Type: application/json');

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

require_auth();
require_role('customer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!validate_csrf($csrf_token)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
    exit;
}

$address_id = isset($_POST['address_id']) ? (int)$_POST['address_id'] : 0;

if ($address_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid address ID']);
    exit;
}

$user_id = get_logged_in_user_id();

try {
    $stmt = $pdo->prepare("SELECT id FROM addresses WHERE id = ? AND user_id = ?");
    $stmt->execute([$address_id, $user_id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Address not found']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM orders WHERE user_id = ? AND status = 'pending' LIMIT 1");
    $stmt->execute([$user_id]);
    $pending_order = $stmt->fetch();

    if ($pending_order) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Cannot delete address that is used in pending orders']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?");
    $stmt->execute([$address_id, $user_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Address deleted successfully'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete address']);
}