<?php
$page_title = "My Products";
require_once __DIR__ . "/../../includes/config.php";
require_once __DIR__ . "/../../includes/functions.php";
require_once __DIR__ . "/../../includes/auth.php";

require_approved_seller();

$user_id = $_SESSION["user_id"];

try {
    $products = $pdo->prepare('
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.seller_id = ?
        ORDER BY p.created_at DESC
    ');
    $products->execute([$user_id]);
    $products = $products->fetchAll();
} catch (PDOException $e) {
    $products = [];
}

$csrf_token = generate_csrf();
require_once __DIR__ . "/../../includes/header.php";
?>

<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h2 text-heading mb-0">My Products</h1>
        <a href="<?= SITE_URL ?>/pages/seller/product_form.php" class="btn btn-primary">
            <i class="bi bi-plus"></i> Add Product
        </a>
    </div>

    <?php if (empty($products)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-box"></i></div>
            <h2 class="empty-state-title">You haven't listed any products yet</h2>
            <p class="empty-state-text">Start selling by adding your first product.</p>
            <a href="<?= SITE_URL ?>/pages/seller/product_form.php" class="btn btn-primary">Add Product</a>
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
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $product): ?>
                                <tr>
                                    <td>
                                        <?php if ($product["image_path"]): ?>
                                            <img src="<?= sanitize(
                                                asset_url(
                                                    $product["image_path"],
                                                ),
                                            ) ?>" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                        <?php else: ?>
                                            <div class="bg-light rounded" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                                                <i class="bi bi-image text-muted"></i>
                                            </div>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= sanitize($product["name"]) ?></td>
                                    <td><?= sanitize(
                                        $product["category_name"],
                                    ) ?></td>
                                    <td><?= format_currency(
                                        $product["price"],
                                    ) ?></td>
                                    <td><?= $product["stock"] ?></td>
                                    <td>
                                        <span class="badge badge-<?= $product[
                                            "is_active"
                                        ]
                                            ? "success"
                                            : "danger" ?>">
                                            <?= $product["is_active"]
                                                ? "Active"
                                                : "Inactive" ?>
                                        </span>
                                    </td>
                                    <td class="actions-cell">
                                        <div class="action-buttons">
                                            <a href="<?= SITE_URL ?>/pages/seller/product_form.php?id=<?= $product[
    "id"
] ?>" class="icon-btn icon-btn-primary" aria-label="Edit product" title="Edit">
                                                <i class="bi bi-pencil-square" aria-hidden="true"></i>
                                                <span class="sr-only visually-hidden">Edit</span>
                                            </a>
                                            <form method="POST" action="<?= SITE_URL ?>/api/product_status.php">
                                                <input type="hidden" name="csrf_token" value="<?= sanitize(
                                                    $csrf_token,
                                                ) ?>">
                                                <input type="hidden" name="product_id" value="<?= (int) $product[
                                                    "id"
                                                ] ?>">
                                                <input type="hidden" name="is_active" value="<?= $product[
                                                    "is_active"
                                                ]
                                                    ? 0
                                                    : 1 ?>">
                                                <button type="submit" class="icon-btn no-loading <?= $product[
                                                    "is_active"
                                                ]
                                                    ? "icon-btn-warning"
                                                    : "icon-btn-success" ?>" aria-label="<?= $product[
    "is_active"
]
    ? "Deactivate product"
    : "Activate product" ?>" title="<?= $product["is_active"]
    ? "Deactivate"
    : "Activate" ?>">
                                                    <i class="bi <?= $product[
                                                        "is_active"
                                                    ]
                                                        ? "bi-slash-circle"
                                                        : "bi-check2" ?>" aria-hidden="true"></i>
                                                    <span class="sr-only visually-hidden"><?= $product[
                                                        "is_active"
                                                    ]
                                                        ? "Deactivate"
                                                        : "Activate" ?></span>
                                                </button>
                                            </form>
                                            <form method="POST" action="<?= SITE_URL ?>/api/product_delete.php" onsubmit="return confirm('Delete this product? Products with order history can only be deactivated.');">
                                                <input type="hidden" name="csrf_token" value="<?= sanitize(
                                                    $csrf_token,
                                                ) ?>">
                                                <input type="hidden" name="product_id" value="<?= (int) $product[
                                                    "id"
                                                ] ?>">
                                                <button type="submit" class="icon-btn icon-btn-danger no-loading" aria-label="Delete product" title="Delete">
                                                    <i class="bi bi-trash3" aria-hidden="true"></i>
                                                    <span class="sr-only visually-hidden">Delete</span>
                                                </button>
                                            </form>
                                        </div>
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

<?php require_once __DIR__ . "/../../includes/footer.php"; ?>
