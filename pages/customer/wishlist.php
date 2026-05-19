<?php
$page_title = 'Wishlist';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/modules/WishlistModule.php';

require_role('customer');

$wishlist = new WishlistModule();

try {
    $items = $wishlist->getItems($pdo, (int) $_SESSION['user_id']);
} catch (PDOException $e) {
    $items = [];
}

generate_csrf();
require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h2 text-heading mb-0">Wishlist</h1>
        <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-outline-primary">
            <i class="bi bi-shop"></i> Continue Shopping
        </a>
    </div>

    <?php if (empty($items)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-heart"></i></div>
            <h2 class="empty-state-title">Your wishlist is empty</h2>
            <p class="empty-state-text">Save PC parts you want to compare or buy later.</p>
            <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-primary">Browse Products</a>
        </div>
    <?php else: ?>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            <?php foreach ($items as $product): ?>
                <div class="col">
                    <div class="card product-card h-100">
                        <?php if ($product['image_path']): ?>
                            <img src="<?= sanitize(asset_url($product['image_path'])) ?>" class="card-img-top" alt="<?= sanitize($product['name']) ?>">
                        <?php else: ?>
                            <div class="card-img-top bg-light d-flex align-items-center justify-content-center">
                                <i class="bi bi-image text-muted" style="font-size: 4rem;"></i>
                            </div>
                        <?php endif; ?>
                        <div class="card-body">
                            <span class="badge badge-success mb-2 stock-badge">
                                <?= (int) $product['stock'] > 0 ? 'In Stock' : 'Out of Stock' ?>
                            </span>
                            <h5 class="card-title text-heading"><?= sanitize($product['name']) ?></h5>
                            <p class="card-text text-body small"><?= sanitize(substr($product['description'] ?? '', 0, 100)) ?>...</p>
                            <div class="product-card-actions">
                                <span class="product-price"><?= format_currency($product['price']) ?></span>
                                <div class="d-flex gap-2">
                                    <a href="<?= SITE_URL ?>/pages/customer/product_detail.php?id=<?= (int) $product['id'] ?>" class="btn btn-sm btn-outline-primary">View</a>
                                    <form method="POST" action="<?= SITE_URL ?>/api/wishlist_toggle.php" class="wishlist-form">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                                        <button type="submit" class="btn btn-sm btn-outline-danger no-loading" aria-label="Remove from wishlist" title="Remove from wishlist">
                                            <i class="bi bi-heart-fill"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>
