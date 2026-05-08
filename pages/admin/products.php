<?php
$page_title = 'All Products';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_role('admin');

try {
    $products = $pdo->query('
        SELECT p.*, c.name as category_name, u.username as seller_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.seller_id = u.id
        ORDER BY p.created_at DESC
    ')->fetchAll();
} catch (PDOException $e) {
    $products = [];
}

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">All Products</h1>

    <?php if (empty($products)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-box"></i></div>
            <h2 class="empty-state-title">No products found</h2>
            <p class="empty-state-text">No products have been listed yet.</p>
        </div>
    <?php else: ?>
        <div class="card shadow-primary">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Seller</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $product): ?>
                                <tr>
                                    <td>
                                        <?php if ($product['image_path']): ?>
                                            <img src="<?= sanitize($product['image_path']) ?>" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                        <?php else: ?>
                                            <div class="bg-light rounded" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                                                <i class="bi bi-image text-muted"></i>
                                            </div>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= sanitize($product['name']) ?></td>
                                    <td><?= sanitize($product['category_name']) ?></td>
                                    <td><?= sanitize($product['seller_name'] ?? 'N/A') ?></td>
                                    <td>$<?= number_format($product['price'], 2) ?></td>
                                    <td><?= $product['stock'] ?></td>
                                    <td>
                                        <span class="badge badge-<?= $product['is_active'] ? 'success' : 'danger' ?>">
                                            <?= $product['is_active'] ? 'Active' : 'Inactive' ?>
                                        </span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>