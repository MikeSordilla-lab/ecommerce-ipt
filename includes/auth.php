<?php

function require_auth() {
    if (!isset($_SESSION['user_id'])) {
        redirect('/pages/auth/login.php');
    }
}

function check_role(string $role): bool {
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    return ($_SESSION['role'] === $role);
}

function check_roles(array $roles): bool {
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    return in_array($_SESSION['role'], $roles);
}

function check_approved_seller(): bool {
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    if ($_SESSION['role'] !== 'seller') {
        return false;
    }
    global $pdo;
    $stmt = $pdo->prepare('SELECT is_approved FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    return ($user && $user['is_approved'] == 1);
}

function require_role($role) {
    require_auth();

    if (!check_role($role)) {
        set_flash('error', 'Access Denied', 'You do not have permission to access this page.');
        redirect('/');
    }
}

function require_roles($roles) {
    require_auth();

    if (!check_roles($roles)) {
        set_flash('error', 'Access Denied', 'You do not have permission to access this page.');
        redirect('/');
    }
}

function require_approved_seller() {
    require_auth();

    if ($_SESSION['role'] !== 'seller') {
        set_flash('error', 'Access Denied', 'You must be a seller to access this page.');
        redirect('/');
    }

    global $pdo;
    $stmt = $pdo->prepare('SELECT is_approved FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || $user['is_approved'] != 1) {
        set_flash('warning', 'Pending Approval', 'Your seller account is awaiting approval. Please wait for an administrator to approve your seller account.');
        redirect('/');
    }
}