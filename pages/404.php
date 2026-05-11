<?php
$page_title = 'Page Not Found';
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

if (is_logged_in()) {
    $role = get_user_role();
    switch ($role) {
        case 'admin':
            $home_link = '/pages/admin/dashboard.php';
            break;
        case 'seller':
            $home_link = '/pages/seller/dashboard.php';
            break;
        case 'customer':
            $home_link = '/pages/customer/shop.php';
            break;
        default:
            $home_link = '/pages/auth/login.php';
    }
} else {
    $home_link = '/';
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container text-center py-5">
    <div class="mb-4">
        <h1 class="display-1 text-primary">404</h1>
    </div>
    <h2 class="h3 text-heading mb-3">Page Not Found</h2>
    <p class="text-body mb-4">
        The page you're looking for doesn't exist or has been moved.
    </p>
    <a href="<?= $home_link ?>" class="btn btn-primary">
        <i class="bi bi-house"></i> Go Home
    </a>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>