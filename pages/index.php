<?php
// Can be loaded directly or included from root index.php
if (!defined('SITE_URL')) {
    require_once __DIR__ . '/../includes/config.php';
    require_once __DIR__ . '/../includes/functions.php';
}

// Fetch categories with product counts
$categories = [];
try {
    $stmt = $pdo->query("
        SELECT c.id, c.name, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
        GROUP BY c.id, c.name
        ORDER BY c.name
    ");
    $categories = $stmt->fetchAll();
} catch (PDOException $e) {
    // silently fail
}

// Fetch featured products
$featured_products = [];
try {
    $stmt = $pdo->query("
        SELECT p.id, p.name, p.description, p.price, p.stock, p.image_path,
               u.username as seller_name, c.name as category_name
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1 AND p.stock > 0
        ORDER BY p.created_at DESC
        LIMIT 6
    ");
    $featured_products = $stmt->fetchAll();
} catch (PDOException $e) {
    // silently fail
}

// Fetch stats
$stats = ['products' => 0, 'sellers' => 0, 'orders' => 0];
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products WHERE is_active = 1");
    $stats['products'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'seller' AND is_approved = 1");
    $stats['sellers'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM orders");
    $stats['orders'] = (int) $stmt->fetchColumn();
} catch (PDOException $e) {
    // silently fail
}

$category_icons = [
    'Electronics' => 'bi-cpu',
    'Clothing' => 'bi-bag',
    'Home & Garden' => 'bi-house-heart',
    'Books' => 'bi-book',
    'Sports' => 'bi-trophy',
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= SITE_NAME ?> — The Smarter Way to Shop Online</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="<?= asset_url('/css/styles.css') ?>" rel="stylesheet">
    <style>
        @font-face {
            font-family: 'sohne-var';
            src: local('SF Pro Display'), local('-apple-system'), local('BlinkMacSystemFont');
            font-weight: 100 900;
            font-style: normal;
        }
    </style>
</head>
<body style="font-family: sohne-var, 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-feature-settings: 'ss01';">

<!-- Navigation -->
<nav class="landing-nav" id="landingNav">
    <div class="nav-container">
        <a href="<?= SITE_URL ?>" class="brand">
            <i class="bi bi-bag-heart-fill brand-icon"></i>
            <span><?= SITE_NAME ?></span>
        </a>
        <ul class="nav-links" id="navLinks">
            <li class="nav-link-item"><a href="#features">Features</a></li>
            <li class="nav-link-item"><a href="#how-it-works">How It Works</a></li>
            <li class="nav-link-item"><a href="#categories">Categories</a></li>
            <li class="nav-link-item"><a href="#products">Products</a></li>
            <li class="mobile-cta d-md-none">
                <a href="<?= SITE_URL ?>/pages/auth/login.php" class="btn btn-outline-primary w-100" style="border-color: var(--color-primary-light); color: var(--color-primary);">Login</a>
                <a href="<?= SITE_URL ?>/pages/auth/register.php" class="btn btn-primary w-100">Start Shopping</a>
            </li>
        </ul>
        <div class="nav-actions">
            <a href="<?= SITE_URL ?>/pages/auth/login.php" class="btn btn-outline-primary" style="border-color: var(--color-primary-light); color: var(--color-primary); font-size: 0.875rem; font-weight: 400; padding: 0.5rem 1rem; border-radius: var(--radius-standard);">Login</a>
            <a href="<?= SITE_URL ?>/pages/auth/register.php" class="btn btn-primary" style="background: var(--color-primary); border-color: var(--color-primary); font-size: 0.875rem; font-weight: 400; padding: 0.5rem 1rem; border-radius: var(--radius-standard);">Start Shopping</a>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
                <i class="bi bi-list" style="font-size: 1.25rem;"></i>
            </button>
        </div>
    </div>
</nav>

<!-- Hero Section -->
<section class="hero-section">
    <div class="gradient-orb gradient-orb-ruby hero-orb-1"></div>
    <div class="gradient-orb gradient-orb-magenta hero-orb-2"></div>
    <div class="hero-container">
        <h1 class="display-hero hero-headline">
            The smarter way<br>to shop online
        </h1>
        <p class="body-large hero-subtitle">
            Discover quality products from trusted sellers. Track your orders every step of the way. Pay securely with cash on delivery.
        </p>
        <div class="hero-actions">
            <a href="<?= SITE_URL ?>/pages/auth/register.php" class="btn btn-primary btn-lg" style="background: var(--color-primary); border-color: var(--color-primary); font-size: 1rem; font-weight: 400; padding: 0.625rem 1.5rem; border-radius: var(--radius-standard);">
                Start Shopping
            </a>
            <a href="#features" class="btn btn-outline-primary btn-lg" style="background: transparent; border: 1px solid var(--color-primary-light); color: var(--color-primary); font-size: 1rem; font-weight: 400; padding: 0.625rem 1.5rem; border-radius: var(--radius-standard);">
                Learn More
            </a>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="features-section" id="features">
    <div class="features-container">
        <div class="text-center">
            <h2 class="section-heading">Built for modern commerce</h2>
            <p class="body-large mt-3">Everything you need for a seamless shopping experience.</p>
        </div>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="bi bi-bag-check"></i>
                </div>
                <h3>Quality Products</h3>
                <p>Browse curated products across multiple categories. Find exactly what you need at competitive prices from verified sellers.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="bi bi-truck"></i>
                </div>
                <h3>Order Tracking</h3>
                <p>Stay updated with real-time order status. Know exactly when your products are shipped, in transit, and delivered.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="bi bi-shield-check"></i>
                </div>
                <h3>Secure Checkout</h3>
                <p>Pay with confidence using cash on delivery. Only pay when your order arrives at your doorstep.</p>
            </div>
        </div>
    </div>
</section>

<!-- How It Works Section -->
<section class="how-section" id="how-it-works">
    <div class="how-container">
        <h2 class="section-heading">How it works</h2>
        <p class="body-large mt-3">Three simple steps from browsing to receiving.</p>
        <div class="how-grid">
            <div class="step-card">
                <div class="step-number">1</div>
                <h3>Browse & Discover</h3>
                <p>Explore products by category, search for specific items, or browse featured picks from top sellers.</p>
            </div>
            <div class="step-card">
                <div class="step-number">2</div>
                <h3>Add to Cart</h3>
                <p>Build your cart with everything you need. Review quantities, prices, and your total before checkout.</p>
            </div>
            <div class="step-card">
                <div class="step-number">3</div>
                <h3>Receive & Pay</h3>
                <p>Place your order and wait for delivery. Pay cash when your package arrives — no upfront payment needed.</p>
            </div>
        </div>
    </div>
</section>

<!-- Categories Section -->
<?php if (!empty($categories)): ?>
<section class="categories-section" id="categories">
    <div class="categories-container">
        <h2 class="section-heading">Shop by category</h2>
        <p class="body-large mt-3">Find what you're looking for in our curated collections.</p>
        <div class="categories-grid">
            <?php foreach ($categories as $cat): ?>
            <a href="<?= SITE_URL ?>/pages/auth/login.php" class="category-card">
                <div class="category-icon">
                    <i class="bi <?= $category_icons[$cat['name']] ?? 'bi-grid' ?>"></i>
                </div>
                <h3><?= sanitize($cat['name']) ?></h3>
                <span class="product-count"><?= (int) $cat['product_count'] ?> product<?= (int) $cat['product_count'] !== 1 ? 's' : '' ?></span>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Featured Products Section -->
<?php if (!empty($featured_products)): ?>
<section class="products-section" id="products">
    <div class="products-container">
        <h2 class="section-heading">Featured products</h2>
        <p class="body-large mt-3">Handpicked items ready to ship.</p>
        <div class="products-grid">
            <?php foreach ($featured_products as $product): ?>
            <a href="<?= SITE_URL ?>/pages/auth/login.php" class="product-card-landing">
                <?php if (!empty($product['image_path']) && file_exists(dirname(__DIR__) . $product['image_path'])): ?>
                <img src="<?= asset_url($product['image_path']) ?>" alt="<?= sanitize($product['name']) ?>" class="product-image" loading="lazy">
                <?php else: ?>
                <div class="product-image-placeholder">
                    <i class="bi bi-image"></i>
                </div>
                <?php endif; ?>
                <div class="product-info">
                    <h3 class="product-name"><?= sanitize($product['name']) ?></h3>
                    <?php if (!empty($product['description'])): ?>
                    <p class="product-desc"><?= sanitize($product['description']) ?></p>
                    <?php endif; ?>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="product-price"><?= format_currency($product['price']) ?></span>
                    </div>
                    <?php if ((int) $product['stock'] > 0): ?>
                    <span class="product-stock"><?= (int) $product['stock'] ?> in stock</span>
                    <?php endif; ?>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
        <div class="mt-4">
            <a href="<?= SITE_URL ?>/pages/auth/login.php" class="btn btn-outline-primary" style="border-color: var(--color-primary-light); color: var(--color-primary); font-size: 0.875rem; font-weight: 400; padding: 0.5rem 1.5rem; border-radius: var(--radius-standard);">
                View All Products
            </a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Dark Brand Section with Stats -->
<section class="dark-section">
    <div class="gradient-orb gradient-orb-purple" style="width: 500px; height: 500px; top: -200px; left: 50%; transform: translateX(-50%); opacity: 0.15;"></div>
    <div class="dark-container">
        <h2 class="display-large">Trusted by shoppers<br>and sellers alike</h2>
        <p class="body-large mt-3" style="color: rgba(255,255,255,0.7);">
            Join a growing community of buyers and sellers on <?= SITE_NAME ?>.
        </p>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number"><?= number_format($stats['products']) ?></div>
                <div class="stat-label">Active Products</div>
            </div>
            <div class="stat-item">
                <div class="stat-number"><?= number_format($stats['sellers']) ?></div>
                <div class="stat-label">Verified Sellers</div>
            </div>
            <div class="stat-item">
                <div class="stat-number"><?= number_format($stats['orders']) ?></div>
                <div class="stat-label">Orders Placed</div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="cta-section">
    <div class="gradient-orb gradient-orb-ruby" style="width: 300px; height: 300px; bottom: -100px; right: -50px; opacity: 0.2;"></div>
    <div class="gradient-orb gradient-orb-magenta" style="width: 250px; height: 250px; top: -80px; left: -60px; opacity: 0.15;"></div>
    <div class="cta-container">
        <h2 class="display-large">Start shopping today</h2>
        <p class="body-large">
            It's free to register. Browse products, manage your cart, and track orders — all in one place.
        </p>
        <div class="d-flex gap-3 justify-content-center flex-wrap">
            <a href="<?= SITE_URL ?>/pages/auth/register.php" class="btn btn-primary btn-lg" style="background: var(--color-primary); border-color: var(--color-primary); font-size: 1rem; font-weight: 400; padding: 0.625rem 2rem; border-radius: var(--radius-standard);">
                Create Account
            </a>
            <a href="<?= SITE_URL ?>/pages/auth/login.php" class="btn btn-outline-primary btn-lg" style="background: transparent; border: 1px solid var(--color-primary-light); color: var(--color-primary); font-size: 1rem; font-weight: 400; padding: 0.625rem 2rem; border-radius: var(--radius-standard);">
                Sign In
            </a>
        </div>
    </div>
</section>

<!-- Footer -->
<footer class="landing-footer">
    <div class="footer-container">
        <div class="footer-brand">
            <i class="bi bi-bag-heart-fill" style="color: var(--color-primary);"></i>
            <?= SITE_NAME ?>
        </div>
        <ul class="footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#categories">Categories</a></li>
            <li><a href="<?= SITE_URL ?>/pages/auth/login.php">Login</a></li>
            <li><a href="<?= SITE_URL ?>/pages/auth/register.php">Register</a></li>
        </ul>
        <div class="footer-copy">
            &copy; <?= date('Y') ?> <?= SITE_NAME ?>. All rights reserved.
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Sticky nav shadow on scroll
const nav = document.getElementById('landingNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
});

// Mobile nav toggle
document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('navLinks').classList.remove('active');
        }
    });
});
</script>
</body>
</html>
