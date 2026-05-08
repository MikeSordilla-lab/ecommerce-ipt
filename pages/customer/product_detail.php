<?php
$page_title = 'Product Details';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_role('customer');

$product_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$product_id) {
    set_flash('error', 'Error', 'Invalid product.');
    redirect(SITE_URL . '/pages/customer/shop.php');
}

try {
    $stmt = $pdo->prepare('
        SELECT p.*, c.name as category_name, u.username as seller_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE p.id = ? AND p.is_active = 1
    ');
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        set_flash('error', 'Error', 'Product not found.');
        redirect(SITE_URL . '/pages/customer/shop.php');
    }
} catch (PDOException $e) {
    set_flash('error', 'Error', 'Could not load product.');
    redirect(SITE_URL . '/pages/customer/shop.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $quantity = max(1, min((int)($_POST['quantity'] ?? 1), $product['stock']));

    if ($quantity > 0 && $product['stock'] > 0) {
        try {
            $stmt = $pdo->prepare('
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = quantity + ?
            ');
            $stmt->execute([$_SESSION['user_id'], $product_id, $quantity, $quantity]);

            $cart_count = $pdo->prepare('SELECT SUM(quantity) FROM cart_items WHERE user_id = ?');
            $cart_count->execute([$_SESSION['user_id']]);
            $count = $cart_count->fetchColumn() ?: 0;

            set_flash('success', 'Added to Cart', "\"{$product['name']}\" ($quantity) has been added to your cart.");
            redirect(SITE_URL . '/pages/customer/cart.php');
        } catch (PDOException $e) {
            set_flash('error', 'Error', 'Could not add to cart.');
        }
    } else {
        set_flash('warning', 'Out of Stock', 'This product is currently out of stock.');
    }
}

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container">
    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="<?= SITE_URL ?>/pages/customer/shop.php">Shop</a></li>
            <li class="breadcrumb-item"><a href="<?= SITE_URL ?>/pages/customer/shop.php?category=<?= $product['category_id'] ?>"><?= sanitize($product['category_name']) ?></a></li>
            <li class="breadcrumb-item active"><?= sanitize($product['name']) ?></li>
        </ol>
    </nav>

    <div class="row">
        <div class="col-md-6">
            <?php if ($product['image_path']): ?>
                <img src="<?= sanitize($product['image_path']) ?>" class="img-fluid rounded" alt="<?= sanitize($product['name']) ?>">
            <?php else: ?>
                <div class="bg-light rounded d-flex align-items-center justify-content-center" style="min-height: 400px;">
                    <i class="bi bi-image text-muted" style="font-size: 6rem;"></i>
                </div>
            <?php endif; ?>
        </div>

        <div class="col-md-6">
            <span class="badge badge-success mb-2"><?= sanitize($product['category_name']) ?></span>
            <h1 class="h2 text-heading mb-2"><?= sanitize($product['name']) ?></h1>
            <p class="text-body small mb-2">Sold by: <?= sanitize($product['seller_name'] ?? 'Shop') ?></p>

            <h2 class="product-price mb-3">$<?= number_format($product['price'], 2) ?></h2>

            <p class="text-body mb-4"><?= nl2br(sanitize($product['description'])) ?></p>

            <div class="mb-3">
                <?php if ($product['stock'] > 0): ?>
                    <span class="badge badge-success stock-badge"><?= $product['stock'] ?> in stock</span>
                <?php else: ?>
                    <span class="badge badge-danger stock-badge">Out of Stock</span>
                <?php endif; ?>
            </div>

            <?php if ($product['stock'] > 0): ?>
                <form method="POST" class="row g-3">
                    <div class="col-auto">
                        <label for="quantity" class="form-label">Quantity</label>
                        <input type="number" class="form-control" id="quantity" name="quantity"
                               value="1" min="1" max="<?= $product['stock'] ?>" style="width: 100px;">
                    </div>
                    <div class="col-auto d-flex align-items-end">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="bi bi-cart3"></i> Add to Cart
                        </button>
                    </div>
                </form>
            <?php else: ?>
                <button class="btn btn-secondary btn-lg" disabled>Out of Stock</button>
            <?php endif; ?>

            <div class="mt-4">
                <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left"></i> Back to Shop
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>