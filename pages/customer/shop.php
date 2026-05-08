<?php
$page_title = 'Shop';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_role('customer');

try {
    $category_id = isset($_GET['category']) ? (int)$_GET['category'] : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $per_page = 12;

    $categories_stmt = $pdo->query('SELECT id, name FROM categories ORDER BY name');
    $categories = $categories_stmt->fetchAll();

    $where_conditions = ['p.is_active = 1'];
    $params = [];

    if ($category_id) {
        $where_conditions[] = 'p.category_id = ?';
        $params[] = $category_id;
    }

    if ($search) {
        $where_conditions[] = '(p.name LIKE ? OR p.description LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $where_sql = implode(' AND ', $where_conditions);

    $count_sql = "SELECT COUNT(*) FROM products p WHERE $where_sql";
    $stmt = $pdo->prepare($count_sql);
    $stmt->execute($params);
    $total_products = $stmt->fetchColumn();

    $total_pages = ceil($total_products / $per_page);
    $offset = ($page - 1) * $per_page;

    $products_sql = "SELECT p.*, c.name as category_name, u.username as seller_name
                     FROM products p
                     JOIN categories c ON p.category_id = c.id
                     LEFT JOIN users u ON p.seller_id = u.id
                     WHERE $where_sql
                     ORDER BY p.created_at DESC
                     LIMIT ? OFFSET ?";
    $params[] = $per_page;
    $params[] = $offset;

    $stmt = $pdo->prepare($products_sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

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
                            <a class="page-link" href="?page=<?= $page - 1 ?>&category=<?= $category_id ?>&search=<?= urlencode($search) ?>">Previous</a>
                        </li>
                    <?php endif; ?>

                    <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                        <li class="page-item <?= $i == $page ? 'active' : '' ?>">
                            <a class="page-link" href="?page=<?= $i ?>&category=<?= $category_id ?>&search=<?= urlencode($search) ?>">
                                <?= $i ?>
                            </a>
                        </li>
                    <?php endfor; ?>

                    <?php if ($page < $total_pages): ?>
                        <li class="page-item">
                            <a class="page-link" href="?page=<?= $page + 1 ?>&category=<?= $category_id ?>&search=<?= urlencode($search) ?>">Next</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </nav>
        <?php endif; ?>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>