<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['count' => 0]);
    exit;
}

if ($_SESSION['role'] !== 'customer') {
    http_response_code(403);
    echo json_encode(['count' => 0]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['count' => 0]);
    exit;
}

try {
    $user_id = $_SESSION['user_id'];

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM cart_items WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $count = $stmt->fetchColumn();

    echo json_encode(['count' => (int)$count]);

} catch (PDOException $e) {
    echo json_encode(['count' => 0]);
}