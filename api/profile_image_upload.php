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

$allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
$allowed_extensions = ['jpg', 'jpeg', 'png', 'webp'];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime_type, $allowed_types)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Allowed: JPG, PNG, WebP']);
    exit;
}

if ($file['size'] > 2 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File too large. Max 2MB allowed']);
    exit;
}

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($extension, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file extension']);
    exit;
}

$upload_dir = __DIR__ . '/../uploads/profiles/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$filename = 'user_' . $_SESSION['user_id'] . '_' . time() . '.' . $extension;
$upload_path = $upload_dir . $filename;

if (!move_uploaded_file($file['tmp_name'], $upload_path)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file']);
    exit;
}

$profile_image_url = '/uploads/profiles/' . $filename;

try {
    $stmt = $pdo->prepare('UPDATE users SET profile_image = ? WHERE id = ?');
    $stmt->execute([$profile_image_url, $_SESSION['user_id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Profile image uploaded successfully',
        'profile_image' => asset_url($profile_image_url)
    ]);
} catch (PDOException $e) {
    unlink($upload_path);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
