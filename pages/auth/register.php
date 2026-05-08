<?php
$page_title = 'Register';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf($_POST['csrf_token'] ?? '')) {
        set_flash('error', 'Error', 'Invalid CSRF token.');
        redirect($_SERVER['REQUEST_URI']);
    }

    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $role = $_POST['role'] ?? 'customer';

    $errors = [];

    if (empty($username)) {
        $errors[] = 'Username is required.';
    } elseif (!preg_match('/^[a-zA-Z0-9_]{3,50}$/', $username)) {
        $errors[] = 'Username must be 3-50 characters (letters, numbers, underscore only).';
    }

    if (empty($email)) {
        $errors[] = 'Email is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address.';
    }

    if (empty($password)) {
        $errors[] = 'Password is required.';
    } elseif (strlen($password) < 6) {
        $errors[] = 'Password must be at least 6 characters.';
    }

    if ($password !== $confirm_password) {
        $errors[] = 'Passwords do not match.';
    }

    if (!in_array($role, ['customer', 'seller'])) {
        $role = 'customer';
    }

    if (!empty($errors)) {
        foreach ($errors as $error) {
            set_flash('error', 'Validation Error', $error);
        }
        redirect(SITE_URL . '/pages/auth/register.php');
    }

    try {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            set_flash('error', 'Registration Failed', 'Username or email already exists.');
            redirect(SITE_URL . '/pages/auth/register.php');
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $is_approved = ($role === 'seller') ? 0 : 1;

        $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$username, $email, $password_hash, $role, $is_approved]);

        if ($role === 'seller') {
            set_flash('success', 'Registration Successful', 'Your seller account is pending admin approval.');
        } else {
            set_flash('success', 'Registration Successful', 'You can now log in with your credentials.');
        }
        redirect(SITE_URL . '/pages/auth/login.php');

    } catch (PDOException $e) {
        set_flash('error', 'Error', 'A database error occurred. Please try again.');
        redirect(SITE_URL . '/pages/auth/register.php');
    }
}

require_once __DIR__ . '/../../includes/header.php';
generate_csrf();
?>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="card shadow-primary mt-5">
                <div class="card-body p-5">
                    <h1 class="h3 mb-4 text-center">Create Account</h1>

                    <form method="POST" action="">
                        <?= csrf_field() ?>
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" name="username"
                                   value="<?= sanitize($_POST['username'] ?? '') ?>" required autofocus>
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email"
                                   value="<?= sanitize($_POST['email'] ?? '') ?>" required>
                        </div>

                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>

                        <div class="mb-3">
                            <label for="confirm_password" class="form-label">Confirm Password</label>
                            <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Account Type</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="role" id="role_customer" value="customer" checked>
                                <label class="form-check-label" for="role_customer">
                                    <i class="bi bi-person"></i> Customer - Shop and buy products
                                </label>
                            </div>
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="radio" name="role" id="role_seller" value="seller">
                                <label class="form-check-label" for="role_seller">
                                    <i class="bi bi-shop"></i> Seller - Sell products (requires approval)
                                </label>
                            </div>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg">
                                Create Account
                            </button>
                        </div>
                    </form>

                    <div class="text-center mt-4">
                        <p class="text-body mb-0">
                            Already have an account? <a href="<?= SITE_URL ?>/pages/auth/login.php">Sign In</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>