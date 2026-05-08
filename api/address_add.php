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

$full_name = trim($_POST['full_name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$address = trim($_POST['address'] ?? '');
$is_default = isset($_POST['is_default']) ? (int)$_POST['is_default'] : 0;

if (strlen($full_name) < 2 || strlen($full_name) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Full name must be 2-100 characters']);
    exit;
}

if (!preg_match('/^[\d\s+\-]{5,20}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Phone must be 5-20 characters (digits, +, -, or spaces only)']);
    exit;
}

if (strlen($address) < 10 || strlen($address) > 500) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Address must be 10-500 characters']);
    exit;
}

$user_id = get_logged_in_user_id();

try {
    $pdo->beginTransaction();

    if ($is_default === 1) {
        $stmt = $pdo->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ? AND is_default = 1");
        $stmt->execute([$user_id]);
    }

    $stmt = $pdo->prepare("INSERT INTO addresses (user_id, full_name, phone, address, is_default) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $full_name, $phone, $address, $is_default]);
    $address_id = $pdo->lastInsertId();

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'address_id' => (int)$address_id,
        'message' => 'Address added successfully'
    ]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to add address']);
}