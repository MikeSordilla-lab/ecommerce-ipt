<?php
$page_title = 'Welcome';
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

if (is_logged_in()) {
    $role = get_user_role();
    switch ($role) {
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
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center text-center">
        <div class="col-lg-8">
            <h1 class="display-4 mb-4 text-heading">
                <span class="brand-icon"><i class="bi bi-bag"></i></span>
                Welcome to <?= SITE_NAME ?>
            </h1>
            <p class="lead text-body mb-5">
                A modern e-commerce platform for all your shopping needs.
            </p>

            <div class="row g-4 justify-content-center">
                <div class="col-md-4">
                    <div class="card h-100 shadow-primary">
                        <div class="card-body">
                            <div class="mb-3">
                                <i class="bi bi-shop text-primary" style="font-size: 3rem;"></i>
                            </div>
                            <h3 class="h5 text-heading">Shop Products</h3>
                            <p class="text-body mb-0">Browse our wide selection of products across multiple categories.</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-primary">
                        <div class="card-body">
                            <div class="mb-3">
                                <i class="bi bi-box-seam text-primary" style="font-size: 3rem;"></i>
                            </div>
                            <h3 class="h5 text-heading">Track Orders</h3>
                            <p class="text-body mb-0">Monitor your orders from placement to delivery.</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-primary">
                        <div class="card-body">
                            <div class="mb-3">
                                <i class="bi bi-credit-card text-primary" style="font-size: 3rem;"></i>
                            </div>
                            <h3 class="h5 text-heading">Secure Checkout</h3>
                            <p class="text-body mb-0">Safe and easy cash on delivery payment options.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-5">
                <a href="<?= SITE_URL ?>/pages/auth/login.php" class="btn btn-outline-primary btn-lg me-3">
                    <i class="bi bi-box-arrow-in-right"></i> Sign In
                </a>
                <a href="<?= SITE_URL ?>/pages/auth/register.php" class="btn btn-primary btn-lg">
                    <i class="bi bi-person-plus"></i> Create Account
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>