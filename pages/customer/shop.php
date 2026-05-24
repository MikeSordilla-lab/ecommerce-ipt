<?php
$page_title = 'Shop';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/modules/ProductBrowsingModule.php';
require_once __DIR__ . '/../../includes/modules/WishlistModule.php';

require_role('customer');

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare('SELECT username, email, role, profile_image, created_at FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $current_user = $stmt->fetch();
} catch (PDOException $e) {
    $current_user = null;
}

try {
    $category_id = isset($_GET['category']) ? (int)$_GET['category'] : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $per_page = 12;

    $categories_stmt = $pdo->query(
        'SELECT c.id, c.name, COUNT(p.id) AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
         GROUP BY c.id, c.name
         ORDER BY c.name'
    );
    $categories = $categories_stmt->fetchAll();
    $total_category_products = array_sum(array_map(static fn($cat) => (int)$cat['product_count'], $categories));

    $filters = [];
    if ($category_id) {
        $filters['category_id'] = $category_id;
    }
    if ($search) {
        $filters['search'] = $search;
    }
    $price_range = $_GET['price_range'] ?? '';
    $filters['price_range'] = $price_range;

    $productModule = new ProductBrowsingModule();
    $result = $productModule->getProducts($pdo, $filters, $page, $per_page);
    $products = $result['products'];
    $total_products = $result['total'];
    $total_pages = $result['total_pages'];

    $cart_count = 0;
    $cart_stmt = $pdo->prepare('SELECT COALESCE(SUM(quantity), 0) FROM cart_items WHERE user_id = ?');
    $cart_stmt->execute([$_SESSION['user_id']]);
    $cart_count = $cart_stmt->fetchColumn();
    $wishlist = new WishlistModule();
    $wishlisted_ids = $wishlist->getProductIds($pdo, (int) $_SESSION['user_id']);

} catch (PDOException $e) {
    $products = [];
    $categories = [];
    $total_category_products = 0;
    $total_pages = 0;
    $cart_count = 0;
    $wishlisted_ids = [];
    $price_range = '';
}

$category_icons = [
    'Processors' => 'bi-cpu',
    'Graphics Cards' => 'bi-gpu-card',
    'Memory' => 'bi-memory',
    'Storage' => 'bi-device-ssd',
    'Monitors' => 'bi-display',
    'Peripherals' => 'bi-keyboard',
];
$price_ranges = [
    '' => 'Any price',
    'under100' => 'Under ₱100',
    '100to250' => '₱100-250',
    '250to500' => '₱250-500',
    'over500' => 'Over ₱500',
];
$active_category_name = 'All Categories';
foreach ($categories as $cat) {
    if ((int)$category_id === (int)$cat['id']) {
        $active_category_name = $cat['name'];
        break;
    }
}
$shop_filter_url = static function (array $overrides = []): string {
    $params = $_GET;
    unset($params['page']);
    foreach ($overrides as $key => $value) {
        if ($value === null || $value === '') {
            unset($params[$key]);
            continue;
        }
        $params[$key] = $value;
    }
    return SITE_URL . '/pages/customer/shop.php' . ($params ? '?' . http_build_query($params) : '');
};

generate_csrf();
require_once __DIR__ . '/../../includes/header.php';
?>

<?php if ($current_user): ?>
<div class="container">
    <div class="card shadow-primary mb-4 profile-card">
        <div class="card-body py-3">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="user-avatar-small profile-summary-avatar" data-username="<?= sanitize($current_user['username']) ?>" data-profile-image="<?= sanitize(asset_url($current_user['profile_image'] ?? '')) ?>"></div>
                </div>
                <div class="col">
                    <div class="fw-medium text-heading"><?= sanitize($current_user['username']) ?></div>
                    <div class="small text-body"><?= sanitize($current_user['email']) ?></div>
                </div>
                <div class="col-auto">
                    <span class="badge badge-success">Customer</span>
                </div>
                <div class="col-auto">
                    <small class="text-body">Member since <?= date('M Y', strtotime($current_user['created_at'])) ?></small>
                </div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<div class="container">
    <div class="row mb-4">
        <div class="col">
            <h1 class="h2 text-heading">Shop</h1>
        </div>
        <div class="col-auto">
            <a href="<?= SITE_URL ?>/pages/customer/cart.php" class="btn btn-outline-primary position-relative">
                <i class="bi bi-cart3"></i> Cart
                <span class="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="<?= $cart_count > 0 ? '' : 'display: none;' ?>">
                    <?= (int)$cart_count ?>
                </span>
            </a>
        </div>
    </div>

    <div class="shop-filter-panel mb-4">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
            <div>
                <div class="small text-body">Browsing</div>
                <h2 class="h5 mb-0 text-heading"><?= sanitize($active_category_name) ?></h2>
            </div>
            <?php if ($search || $category_id || $price_range): ?>
                <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-outline-secondary btn-sm">
                    <i class="bi bi-x-lg"></i> Clear filters
                </a>
            <?php endif; ?>
        </div>

        <div class="category-chip-row" aria-label="Product categories">
            <a href="<?= $shop_filter_url(['category' => null]) ?>" class="category-chip <?= !$category_id ? 'active' : '' ?>">
                <span class="category-chip-icon"><i class="bi bi-grid"></i></span>
                <span>All</span>
                <small><?= (int)$total_category_products ?></small>
            </a>
            <?php foreach ($categories as $cat): ?>
                <?php $icon = $category_icons[$cat['name']] ?? 'bi-tag'; ?>
                <a href="<?= $shop_filter_url(['category' => (int)$cat['id']]) ?>" class="category-chip <?= (int)$category_id === (int)$cat['id'] ? 'active' : '' ?>">
                    <span class="category-chip-icon"><i class="bi <?= sanitize($icon) ?>"></i></span>
                    <span><?= sanitize($cat['name']) ?></span>
                    <small><?= (int)$cat['product_count'] ?></small>
                </a>
            <?php endforeach; ?>
        </div>

        <form method="GET" class="shop-filter-form mt-3">
            <input type="hidden" name="category" value="<?= $category_id ?: '' ?>">
            <div class="shop-search-field">
                <i class="bi bi-search"></i>
                <input type="text" name="search" class="form-control" placeholder="Search products..." value="<?= sanitize($search) ?>">
            </div>
            <select name="price_range" class="form-select" aria-label="Price range">
                <?php foreach ($price_ranges as $value => $label): ?>
                    <option value="<?= sanitize($value) ?>" <?= $price_range === $value ? 'selected' : '' ?>>
                        <?= sanitize($label) ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <button type="submit" class="btn btn-primary">
                <i class="bi bi-funnel"></i> Apply
            </button>
        </form>
    </div>

    <?php if (empty($products)): ?>
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="bi bi-search"></i>
            </div>
            <h2 class="empty-state-title">No products found</h2>
            <p class="empty-state-text">Try adjusting your search or filter criteria.</p>
            <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-primary">Clear Filters</a>
        </div>
    <?php else: ?>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            <?php foreach ($products as $product): ?>
                <div class="col">
                    <div class="card product-card h-100">
                        <?php if ($product['image_path']): ?>
                            <img src="<?= sanitize(asset_url($product['image_path'])) ?>" class="card-img-top"
                                 alt="<?= sanitize($product['name']) ?>">
                        <?php else: ?>
                            <div class="card-img-top bg-light d-flex align-items-center justify-content-center">
                                <i class="bi bi-image text-muted" style="font-size: 4rem;"></i>
                            </div>
                        <?php endif; ?>
                        <div class="card-body">
                            <span class="badge badge-success mb-2 stock-badge">
                                <?= $product['stock'] > 0 ? 'In Stock' : 'Out of Stock' ?>
                            </span>
                            <h5 class="card-title text-heading"><?= sanitize($product['name']) ?></h5>
                            <p class="card-text text-body small"><?= sanitize(substr($product['description'], 0, 100)) ?>...</p>
                            <div class="product-card-actions">
                                <span class="product-price"><?= format_currency($product['price']) ?></span>
                                <div class="d-flex gap-2">
                                    <?php $is_wishlisted = in_array((int) $product['id'], $wishlisted_ids, true); ?>
                                    <form method="POST" action="<?= SITE_URL ?>/api/wishlist_toggle.php" class="wishlist-form">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="product_id" value="<?= (int)$product['id'] ?>">
                                        <button type="submit" class="btn btn-sm btn-outline-danger no-loading" aria-label="<?= $is_wishlisted ? 'Remove from wishlist' : 'Add to wishlist' ?>" title="<?= $is_wishlisted ? 'Remove from wishlist' : 'Add to wishlist' ?>">
                                            <i class="bi <?= $is_wishlisted ? 'bi-heart-fill' : 'bi-heart' ?>"></i>
                                        </button>
                                    </form>
                                    <form method="POST" action="<?= SITE_URL ?>/api/cart_add.php" class="add-to-cart-form">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="product_id" value="<?= (int)$product['id'] ?>">
                                        <input type="hidden" name="quantity" value="1">
                                        <button type="submit" class="btn btn-sm btn-primary" <?= $product['stock'] <= 0 ? 'disabled' : '' ?>>
                                            <i class="bi bi-cart-plus"></i> Add
                                        </button>
                                    </form>
                                    <a href="<?= SITE_URL ?>/pages/customer/product_detail.php?id=<?= $product['id'] ?>"
                                       class="btn btn-sm btn-outline-primary">View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if ($total_pages > 1): ?>
            <nav class="mt-4">
                <ul class="pagination justify-content-center">
                    <?php if ($page > 1): ?>
                        <li class="page-item">
                            <a class="page-link" href="<?= $shop_filter_url(['page' => $page - 1]) ?>">Previous</a>
                        </li>
                    <?php endif; ?>

                    <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                        <li class="page-item <?= $i == $page ? 'active' : '' ?>">
                            <a class="page-link" href="<?= $shop_filter_url(['page' => $i]) ?>">
                                <?= $i ?>
                            </a>
                        </li>
                    <?php endfor; ?>

                    <?php if ($page < $total_pages): ?>
                        <li class="page-item">
                            <a class="page-link" href="<?= $shop_filter_url(['page' => $page + 1]) ?>">Next</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </nav>
        <?php endif; ?>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>
