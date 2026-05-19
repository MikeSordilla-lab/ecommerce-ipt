<?php

function validate_password_strength(string $password): array
{
    $errors = [];

    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }

    if (!preg_match('/[A-Za-z]/', $password)) {
        $errors[] = 'Password must include at least one letter.';
    }

    if (!preg_match('/\d/', $password)) {
        $errors[] = 'Password must include at least one number.';
    }

    return $errors;
}

function normalize_ph_mobile(?string $phone): ?string
{
    $phone = trim((string) $phone);
    $phone = preg_replace('/[\s\-()]/', '', $phone);

    if (preg_match('/^09\d{9}$/', $phone)) {
        return '+63' . substr($phone, 1);
    }

    if (preg_match('/^\+639\d{9}$/', $phone)) {
        return $phone;
    }

    return null;
}

function validate_ph_mobile(?string $phone): array
{
    return normalize_ph_mobile($phone) === null
        ? ['Phone must be a Philippine mobile number, e.g. 09171234567 or +639171234567.']
        : [];
}
