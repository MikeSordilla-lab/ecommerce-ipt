<?php
$page_title = 'Login';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf($_POST['csrf_token'] ?? '')) {
        set_flash('error', 'Error', 'Invalid CSRF token.');
        redirect($_SERVER['REQUEST_URI']);
    }

    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        set_flash('error', 'Login Failed', 'Please enter both username and password.');
        redirect(SITE_URL . '/pages/auth/login.php');
    }

    try {
        $stmt = $pdo->prepare('SELECT id, username, password_hash, role, is_approved, email_verified_at FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            if (empty($user['email_verified_at'])) {
                set_flash('warning', 'Email Verification Required', 'Please verify your email address before logging in.');
                redirect(SITE_URL . '/pages/auth/login.php');
            }

            if ($user['role'] === 'seller' && !$user['is_approved']) {
                set_flash('warning', 'Account Pending', 'Your seller account is pending admin approval.');
                redirect(SITE_URL . '/pages/auth/login.php');
            }

            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            set_flash('success', 'Welcome!', 'You have successfully logged in.');

            switch ($user['role']) {
                case 'admin':
                    redirect(SITE_URL . '/pages/admin/dashboard.php');
                    break;
                case 'seller':
                    redirect(SITE_URL . '/pages/seller/dashboard.php');
                    break;
                case 'customer':
                    redirect(SITE_URL . '/pages/customer/shop.php');
                    break;
            }
        } else {
            set_flash('error', 'Login Failed', 'Invalid username or password.');
            redirect(SITE_URL . '/pages/auth/login.php');
        }
    } catch (PDOException $e) {
        set_flash('error', 'Error', 'A database error occurred. Please try again.');
        redirect(SITE_URL . '/pages/auth/login.php');
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
                    <h1 class="h3 mb-4 text-center">Welcome Back</h1>

                    <form method="POST" action="">
                        <?= csrf_field() ?>
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" name="username"
                                   value="<?= sanitize($_POST['username'] ?? '') ?>" required autofocus>
                        </div>

                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>

                        <div class="mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="remember" name="remember">
                                <label class="form-check-label" for="remember">
                                    Keep me signed in
                                </label>
                            </div>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg">
                                Sign In
                            </button>
                        </div>
                    </form>

                    <div class="text-center mt-4">
                        <p class="text-body mb-0">
                            Don't have an account? <a href="<?= SITE_URL ?>/pages/auth/register.php">Register</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>
