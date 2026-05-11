<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/ImageHelper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
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

if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit;
}

$file = $_FILES['profile_image'];
$upload_dir = __DIR__ . '/../uploads/profiles/';
$upload = ImageHelper::moveUploadedImage(
    $file,
    $upload_dir,
    '/uploads/profiles/',
    'user_' . $_SESSION['user_id']
);

if (!$upload['success']) {
    $status = in_array($upload['message'], ['Failed to prepare upload directory', 'Failed to save file'], true) ? 500 : 400;
    http_response_code($status);
    echo json_encode(['success' => false, 'message' => $upload['message']]);
    exit;
}

$profile_image_url = $upload['url'];

try {
    $stmt = $pdo->prepare('UPDATE users SET profile_image = ? WHERE id = ?');
    $stmt->execute([$profile_image_url, $_SESSION['user_id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Profile image uploaded successfully',
        'profile_image' => asset_url($profile_image_url)
    ]);
} catch (PDOException $e) {
    unlink($upload['path']);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
