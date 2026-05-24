<?php

require_once __DIR__ . '/functions.php';

$autoload = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($autoload)) {
    require_once $autoload;
}

function mail_is_configured(): bool
{
    return defined('MAIL_HOST') && MAIL_HOST !== '' && MAIL_USERNAME !== '' && MAIL_PASSWORD !== '';
}

function mail_smtp_password(): string
{
    return str_replace(' ', '', (string) MAIL_PASSWORD);
}

function create_email_verification(PDO $pdo, int $userId): string
{
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);

    $stmt = $pdo->prepare(
        'UPDATE users
         SET verification_token_hash = ?, verification_token_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
         WHERE id = ?'
    );
    $stmt->execute([$tokenHash, $userId]);

    return $token;
}

function send_verification_email(string $email, string $username, string $token): bool
{
    $verificationUrl = SITE_URL . '/pages/auth/verify_email.php?token=' . urlencode($token);

    if (!mail_is_configured() || !class_exists(\PHPMailer\PHPMailer\PHPMailer::class)) {
        error_log('Email verification link for ' . $email . ': ' . $verificationUrl);
        return false;
    }

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->Port = MAIL_PORT;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USERNAME;
        $mail->Password = mail_smtp_password();

        if (MAIL_ENCRYPTION === 'ssl') {
            $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        } elseif (MAIL_ENCRYPTION === 'tls') {
            $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
        $mail->addAddress($email, $username);
        $mail->isHTML(true);
        $mail->Subject = 'Verify your ' . SITE_NAME . ' account';
        $safeUsername = sanitize($username);
        $safeUrl = sanitize($verificationUrl);
        $mail->Body = "
            <p>Hello {$safeUsername},</p>
            <p>Please verify your email address to activate your account.</p>
            <p><a href=\"{$safeUrl}\">Verify email address</a></p>
            <p>This link expires in 24 hours.</p>
        ";
        $mail->AltBody = "Verify your account: {$verificationUrl}";

        $mail->send();
        return true;
    } catch (\PHPMailer\PHPMailer\Exception $e) {
        error_log('Verification email failed: ' . $e->getMessage());
        return false;
    }
}
