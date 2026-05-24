<?php

function validate_profile_identity(string $username, string $email): array
{
    $errors = [];
    $username = trim($username);
    $email = trim($email);

    if ($username === '') {
        $errors[] = 'Username is required.';
    } elseif (strlen($username) < 3) {
        $errors[] = 'Username must be at least 3 characters.';
    }

    if ($email === '') {
        $errors[] = 'Email is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address.';
    }

    return $errors;
}
