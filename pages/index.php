<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

// Redirect logged-in users to their dashboard
if (isset($_SESSION['user_id'])) {
    switch ($_SESSION['role']) {
        case 'admin':
            redirect(SITE_URL . '/pages/admin/dashboard.php');
            break;
        case 'seller':
            redirect(SITE_URL . '/pages/seller/dashboard.php');
            break;
        default:
            redirect(SITE_URL . '/pages/customer/shop.php');
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop - Your E-Commerce Platform</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="css/styles.css" rel="stylesheet">
</head>
<body class="bg-white">

<!-- Hero Section -->
<section class="py-5 mt-5">
    <div class="container">
        <div class="row justify-content-center text-center">
            <div class="col-lg-8">
                <h1 class="display-4 fw-light text-heading mb-3" style="color: #061b31; letter-spacing: -0.02em;">
                    The smarter way to shop online
                </h1>
                <p class="lead text-body mb-5" style="color: #64748d;">
                    Discover quality products from trusted sellers. Track your orders every step of the way. Pay securely with cash on delivery.
                </p>
                <div class="d-flex gap-3 justify-content-center">
                    <a href="pages/auth/login.php" class="btn btn-primary btn-lg px-4" style="background: #533afd; border-color: #533afd;">
                        Login
                    </a>
                    <a href="pages/auth/register.php" class="btn btn-outline-primary btn-lg px-4" style="color: #533afd; border-color: #533afd;">
                        Register
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Feature Cards Section -->
<section class="py-5">
    <div class="container">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-primary" style="box-shadow: 0 4px 16px rgba(50,50,93,0.12), 0 2px 4px rgba(50,50,93,0.08); border-radius: 8px;">
                    <div class="card-body text-center p-5">
                        <div class="mb-4">
                            <i class="bi bi-bag display-4" style="color: #533afd;"></i>
                        </div>
                        <h3 class="h5 fw-normal text-heading mb-3" style="color: #061b31;">Shop Quality Products</h3>
                        <p class="text-body mb-0" style="color: #64748d;">
                            Browse thousands of products across multiple categories. Find exactly what you need at competitive prices.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-primary" style="box-shadow: 0 4px 16px rgba(50,50,93,0.12), 0 2px 4px rgba(50,50,93,0.08); border-radius: 8px;">
                    <div class="card-body text-center p-5">
                        <div class="mb-4">
                            <i class="bi bi-truck display-4" style="color: #533afd;"></i>
                        </div>
                        <h3 class="h5 fw-normal text-heading mb-3" style="color: #061b31;">Track Your Orders</h3>
                        <p class="text-body mb-0" style="color: #64748d;">
                            Stay updated with real-time order status. Know exactly when your products are shipped and delivered.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-primary" style="box-shadow: 0 4px 16px rgba(50,50,93,0.12), 0 2px 4px rgba(50,50,93,0.08); border-radius: 8px;">
                    <div class="card-body text-center p-5">
                        <div class="mb-4">
                            <i class="bi bi-shield-check display-4" style="color: #533afd;"></i>
                        </div>
                        <h3 class="h5 fw-normal text-heading mb-3" style="color: #061b31;">Secure Checkout</h3>
                        <p class="text-body mb-0" style="color: #64748d;">
                            Pay with confidence. Cash on delivery means you only pay when you receive your order.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Dark Brand Section -->
<section class="py-5" style="background: #1c1e54;">
    <div class="container">
        <div class="row justify-content-center text-center">
            <div class="col-lg-6">
                <h2 class="h3 fw-light text-white mb-3">
                    Join thousands of satisfied customers
                </h2>
                <p class="text-white-50 mb-0">
                    Start shopping today. It's free to register.
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Footer -->
<footer class="py-4 border-top" style="border-color: #e5edf5 !important;">
    <div class="container">
        <div class="row">
            <div class="col text-center">
                <p class="text-body small mb-0" style="color: #64748d;">
                    &copy; <?= date('Y') ?> Shop. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>