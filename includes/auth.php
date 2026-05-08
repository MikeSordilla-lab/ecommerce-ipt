<?php

function require_auth() {
    if (!isset($_SESSION['user_id'])) {
        redirect('/pages/auth/login.php');
    }
}

function require_role($role) {
    require_auth();

    if ($_SESSION['role'] !== $role) {
        http_response_code(403);
        echo '<!DOCTYPE html>
<html>
<head>
    <title>Access Denied</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container text-center py-5">
        <h1 class="display-4 text-danger">403</h1>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
    </div>
</body>
</html>';
        exit;
    }
}

function require_roles($roles) {
    require_auth();

    if (!in_array($_SESSION['role'], $roles)) {
        http_response_code(403);
        echo '<!DOCTYPE html>
<html>
<head>
    <title>Access Denied</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container text-center py-5">
        <h1 class="display-4 text-danger">403</h1>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
    </div>
</body>
</html>';
        exit;
    }
}

function require_approved_seller() {
    require_auth();

    if ($_SESSION['role'] !== 'seller') {
        http_response_code(403);
        echo '<!DOCTYPE html>
<html>
<head>
    <title>Access Denied</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container text-center py-5">
        <h1 class="display-4 text-danger">403</h1>
        <h2>Access Denied</h2>
        <p>You must be a seller to access this page.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
    </div>
</body>
</html>';
        exit;
    }

    global $pdo;
    $stmt = $pdo->prepare('SELECT is_approved FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || $user['is_approved'] !== 1) {
        http_response_code(403);
        echo '<!DOCTYPE html>
<html>
<head>
    <title>Pending Approval</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container text-center py-5">
        <h1 class="display-4 text-warning">Pending Approval</h1>
        <h2>Your seller account is awaiting approval</h2>
        <p>Please wait for an administrator to approve your seller account.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
    </div>
</body>
</html>';
        exit;
    }
}