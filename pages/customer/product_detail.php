<?php
$page_title = "Product Details";
require_once __DIR__ . "/../../includes/config.php";
require_once __DIR__ . "/../../includes/functions.php";
require_once __DIR__ . "/../../includes/auth.php";
require_once __DIR__ . "/../../includes/modules/CartModule.php";
require_once __DIR__ . "/../../includes/modules/WishlistModule.php";

require_role("customer");

$product_id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

if (!$product_id) {
    set_flash("error", "Error", "Invalid product.");
    redirect(SITE_URL . "/pages/customer/shop.php");
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
        set_flash("error", "Error", "Product not found.");
        redirect(SITE_URL . "/pages/customer/shop.php");
    }
} catch (PDOException $e) {
    set_flash("error", "Error", "Could not load product.");
    redirect(SITE_URL . "/pages/customer/shop.php");
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!validate_csrf($_POST["csrf_token"] ?? "")) {
        set_flash("error", "Error", "Invalid CSRF token.");
        redirect($_SERVER["REQUEST_URI"]);
    }

    $quantity = max(1, min((int) ($_POST["quantity"] ?? 1), (int) $product["stock"]));

    if ($quantity > 0 && $product["stock"] > 0) {
        try {
            $cart = new CartModule();
            $result = $cart->addItem($pdo, (int) $_SESSION["user_id"], $product_id, $quantity);
            set_flash($result["success"] ? "success" : "error", $result["success"] ? "Added to Cart" : "Could not add item", $result["message"]);
            redirect($result["success"] ? SITE_URL . "/pages/customer/cart.php" : $_SERVER["REQUEST_URI"]);
        } catch (PDOException $e) {
            set_flash("error", "Error", "Could not add to cart.");
        }
    } else {
        set_flash(
            "warning",
            "Out of Stock",
            "This product is currently out of stock.",
        );
    }
}

$wishlist = new WishlistModule();
$wishlisted_ids = $wishlist->getProductIds($pdo, (int) $_SESSION["user_id"]);
$is_wishlisted = in_array($product_id, $wishlisted_ids, true);

require_once __DIR__ . "/../../includes/header.php";
generate_csrf();
?>

<div class="container">
    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="<?= SITE_URL ?>/pages/customer/shop.php">Shop</a></li>
            <li class="breadcrumb-item"><a href="<?= SITE_URL ?>/pages/customer/shop.php?category=<?= $product[
    "category_id"
] ?>"><?= sanitize($product["category_name"]) ?></a></li>
            <li class="breadcrumb-item active"><?= sanitize(
                $product["name"],
            ) ?></li>
        </ol>
    </nav>

    <div class="row">
        <div class="col-md-6">
            <?php if ($product["image_path"]): ?>
                <img src="<?= sanitize(
                    asset_url($product["image_path"]),
                ) ?>" class="img-fluid rounded product-detail-image" alt="<?= sanitize(
    $product["name"],
) ?>">
            <?php else: ?>
                <div class="bg-light rounded d-flex align-items-center justify-content-center product-detail-placeholder" style="min-height: 400px;">
                    <i class="bi bi-image text-muted" style="font-size: 6rem;"></i>
                </div>
            <?php endif; ?>
        </div>

        <div class="col-md-6">
            <span class="badge badge-success mb-2"><?= sanitize(
                $product["category_name"],
            ) ?></span>
            <h1 class="h2 text-heading mb-2"><?= sanitize(
                $product["name"],
            ) ?></h1>
            <p class="text-body small mb-2">Sold by: <?= sanitize(
                $product["seller_name"] ?? "Shop",
            ) ?></p>

            <h2 class="product-price mb-3"><?= format_currency(
                $product["price"],
            ) ?></h2>

            <p class="text-body mb-4"><?= nl2br(
                sanitize($product["description"]),
            ) ?></p>

            <div class="mb-3">
                <?php if ($product["stock"] > 0): ?>
                    <span class="badge badge-success stock-badge"><?= $product[
                        "stock"
                    ] ?> in stock</span>
                <?php else: ?>
                    <span class="badge badge-danger stock-badge">Out of Stock</span>
                <?php endif; ?>
            </div>

            <?php if ($product["stock"] > 0): ?>
                <form method="POST" class="row g-3">
                    <?= csrf_field() ?>
                    <div class="col-auto">
                        <label for="quantity" class="form-label">Quantity</label>
                        <input type="number" class="form-control" id="quantity" name="quantity"
                               value="1" min="1" max="<?= $product[
                                   "stock"
                               ] ?>" style="width: 100px;">
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

            <div class="mt-4 d-flex gap-2">
                <form method="POST" action="<?= SITE_URL ?>/api/wishlist_toggle.php" class="wishlist-form">
                    <?= csrf_field() ?>
                    <input type="hidden" name="product_id" value="<?= (int) $product_id ?>">
                    <button type="submit" class="btn btn-outline-danger no-loading">
                        <i class="bi <?= $is_wishlisted ? 'bi-heart-fill' : 'bi-heart' ?>"></i>
                        <?= $is_wishlisted ? 'Saved' : 'Add to Wishlist' ?>
                    </button>
                </form>
                <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left"></i> Back to Shop
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . "/../../includes/footer.php"; ?>
