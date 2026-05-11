<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/modules/AddressModule.php';

header('Content-Type: application/json');

if (!check_role('customer')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Customers only.']);
    exit;
}

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

$addressId = isset($_POST['address_id']) ? (int)$_POST['address_id'] : 0;

if ($addressId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid address ID']);
    exit;
}

$userId = get_logged_in_user_id();

$stmt = $pdo->prepare("SELECT id FROM addresses WHERE id = ? AND user_id = ?");
$stmt->execute([$addressId, $userId]);
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Address not found']);
    exit;
}

try {
    deleteAddress($pdo, $userId, $addressId);

    echo json_encode([
        'success' => true,
        'message' => 'Address deleted successfully'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete address']);
}
