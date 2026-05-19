<?php
$page_title = 'Verify Email';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';

$token = trim($_GET['token'] ?? '');

if ($token === '') {
    set_flash('error', 'Invalid Link', 'The email verification link is missing a token.');
    redirect(SITE_URL . '/pages/auth/login.php');
}

$tokenHash = hash('sha256', $token);

try {
    $stmt = $pdo->prepare(
        'SELECT id, email_verified_at
         FROM users
         WHERE verification_token_hash = ? AND verification_token_expires_at > NOW()
         LIMIT 1'
    );
    $stmt->execute([$tokenHash]);
    $user = $stmt->fetch();

    if (!$user) {
        set_flash('error', 'Invalid Link', 'This verification link is invalid or has expired.');
        redirect(SITE_URL . '/pages/auth/login.php');
    }

    if (empty($user['email_verified_at'])) {
        $stmt = $pdo->prepare(
            'UPDATE users
             SET email_verified_at = NOW(), verification_token_hash = NULL, verification_token_expires_at = NULL
             WHERE id = ?'
        );
        $stmt->execute([(int) $user['id']]);
    }

    set_flash('success', 'Email Verified', 'Your email is verified. You can now log in.');
    redirect(SITE_URL . '/pages/auth/login.php');
} catch (PDOException $e) {
    set_flash('error', 'Error', 'Could not verify your email. Please try again.');
    redirect(SITE_URL . '/pages/auth/login.php');
}
