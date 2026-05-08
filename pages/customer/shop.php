<?php
$page_title = 'Shop';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/modules/ProductBrowsingModule.php';

require_role('customer');

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare('SELECT username, email, role, created_at FROM users WHERE id = ?');
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

    $categories_stmt = $pdo->query('SELECT id, name FROM categories ORDER BY name');
    $categories = $categories_stmt->fetchAll();

    $filters = [];
    if ($category_id) {
        $filters['category_id'] = $category_id;
    }
    if ($search) {
        $filters['search'] = $search;
    }
    $filters['price_range'] = $_GET['price_range'] ?? '';

    $productModule = new ProductBrowsingModule();
    $result = $productModule->getProducts($pdo, $filters, $page, $per_page);
    $products = $result['products'];
    $total_products = $result['total'];
    $total_pages = $result['total_pages'];

    $cart_count = 0;
    $cart_stmt = $pdo->prepare('SELECT COUNT(*) FROM cart_items WHERE user_id = ?');
    $cart_stmt->execute([$_SESSION['user_id']]);
    $cart_count = $cart_stmt->fetchColumn();

} catch (PDOException $e) {
    $products = [];
    $categories = [];
    $total_pages = 0;
    $cart_count = 0;
}

require_once __DIR__ . '/../../includes/header.php';
?>

<?php if ($current_user): ?>
<div class="container">
    <div class="card shadow-primary mb-4 profile-card">
        <div class="card-body py-3">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="profile-avatar-sm">
                        <i class="bi bi-person-circle"></i>
                    </div>
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
                <?php if ($cart_count > 0): ?>
                    <span class="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        <?= $cart_count ?>
                    </span>
                <?php endif; ?>
            </a>
        </div>
    </div>

    <div class="row mb-4">
        <div class="col-md-4">
            <form method="GET" class="d-flex gap-2">
                <select name="category" class="form-select">
                    <option value="">All Categories</option>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?= $cat['id'] ?>" <?= $category_id == $cat['id'] ? 'selected' : '' ?>>
                            <?= sanitize($cat['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="btn btn-outline-primary">Filter</button>
            </form>
        </div>
        <div class="col-md-5">
            <form method="GET" class="d-flex gap-2">
                <input type="hidden" name="category" value="<?= $category_id ?: '' ?>">
                <input type="text" name="search" class="form-control" placeholder="Search products..."
                       value="<?= sanitize($search) ?>">
                <button type="submit" class="btn btn-outline-primary">Search</button>
                <?php if ($search || $category_id): ?>
                    <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-outline-secondary">Clear</a>
                <?php endif; ?>
            </form>
        </div>
    </div>
    <div class="row mb-4">
        <div class="col">
            <div class="btn-group" role="group" aria-label="Price filter">
                <?php $current_price_range = $_GET['price_range'] ?? ''; ?>
                <button type="button" class="btn btn-outline-primary btn-sm <?= $current_price_range === 'under25' ? 'active' : '' ?>" onclick="window.location='?price_range=under25<?= isset($_GET['category']) ? '&category=' . (int)$_GET['category'] : '' ?><?= isset($_GET['search']) ? '&search=' . urlencode($_GET['search']) : '' ?>'">Under $25</button>
                <button type="button" class="btn btn-outline-primary btn-sm <?= $current_price_range === '25to50' ? 'active' : '' ?>" onclick="window.location='?price_range=25to50<?= isset($_GET['category']) ? '&category=' . (int)$_GET['category'] : '' ?><?= isset($_GET['search']) ? '&search=' . urlencode($_GET['search']) : '' ?>'">$25–50</button>
                <button type="button" class="btn btn-outline-primary btn-sm <?= $current_price_range === '50to100' ? 'active' : '' ?>" onclick="window.location='?price_range=50to100<?= isset($_GET['category']) ? '&category=' . (int)$_GET['category'] : '' ?><?= isset($_GET['search']) ? '&search=' . urlencode($_GET['search']) : '' ?>'">$50–100</button>
                <button type="button" class="btn btn-outline-primary btn-sm <?= $current_price_range === 'over100' ? 'active' : '' ?>" onclick="window.location='?price_range=over100<?= isset($_GET['category']) ? '&category=' . (int)$_GET['category'] : '' ?><?= isset($_GET['search']) ? '&search=' . urlencode($_GET['search']) : '' ?>'">Over $100</button>
            </div>
        </div>
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
                            <img src="<?= sanitize($product['image_path']) ?>" class="card-img-top"
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
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="product-price">$<?= number_format($product['price'], 2) ?></span>
                                <a href="<?= SITE_URL ?>/pages/customer/product_detail.php?id=<?= $product['id'] ?>"
                                   class="btn btn-sm btn-outline-primary">View</a>
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
                            <a class="page-link" href="?page=<?= $page - 1 ?>&category=<?= $category_id ?>&search=<?= urlencode($search) ?>&price_range=<?= urlencode($current_price_range) ?>">Previous</a>
                        </li>
                    <?php endif; ?>

                    <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                        <li class="page-item <?= $i == $page ? 'active' : '' ?>">
                            <a class="page-link" href="?page=<?= $i ?>&category=<?= $category_id ?>&search=<?= urlencode($search) ?>&price_range=<?= urlencode($current_price_range) ?>">
                                <?= $i ?>
                            </a>
                        </li>
                    <?php endfor; ?>

                    <?php if ($page < $total_pages): ?>
                        <li class="page-item">
                            <a class="page-link" href="?page=<?= $page + 1 ?>&category=<?= $category_id ?>&search=<?= urlencode($search) ?>&price_range=<?= urlencode($current_price_range) ?>">Next</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </nav>
        <?php endif; ?>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>