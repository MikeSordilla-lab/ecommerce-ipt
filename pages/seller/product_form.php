<?php
$page_title = 'Product Form';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_approved_seller();

$user_id = $_SESSION['user_id'];
$edit_id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$is_edit = $edit_id !== null;
$product = null;

try {
    $categories = $pdo->query('SELECT * FROM categories ORDER BY name')->fetchAll();

    if ($is_edit) {
        $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? AND seller_id = ?');
        $stmt->execute([$edit_id, $user_id]);
        $product = $stmt->fetch();

        if (!$product) {
            set_flash('error', 'Error', 'Product not found.');
redirect(SITE_URL . '/pages/seller/products.php');
        }
    }
} catch (PDOException $e) {
    $categories = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf($_POST['csrf_token'] ?? '')) {
        set_flash('error', 'Error', 'Invalid CSRF token.');
        redirect($_SERVER['REQUEST_URI']);
    }

    $category_id = (int)$_POST['category_id'];
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = (float)$_POST['price'];
    $stock = (int)$_POST['stock'];
    $is_active = array_key_exists('is_active', $_POST)
        ? (($_POST['is_active'] === '1') ? 1 : 0)
        : ($product['is_active'] ?? 1);

    $errors = [];
    if (!$category_id) $errors[] = 'Category is required.';
    if (empty($name) || strlen($name) > 200) $errors[] = 'Name is required (max 200 chars).';
    if ($price <= 0 || $price > 999999.99) $errors[] = 'Price must be between 0.01 and 999999.99.';
    if ($stock < 0) $errors[] = 'Stock cannot be negative.';

    if (!empty($errors)) {
        foreach ($errors as $error) {
            set_flash('error', 'Validation Error', $error);
        }
        redirect(SITE_URL . "/pages/seller/product_form.php" . ($is_edit ? "?id=$edit_id" : ""));
    }

    $image_path = $product['image_path'] ?? null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $allowed = ['image/jpeg', 'image/png', 'image/webp'];
        $max_size = 2 * 1024 * 1024;

        if (!in_array($_FILES['image']['type'], $allowed)) {
            set_flash('error', 'Error', 'Only JPG, PNG, and WebP images are allowed.');
            redirect(SITE_URL . "/pages/seller/product_form.php" . ($is_edit ? "?id=$edit_id" : ""));
        }

        if ($_FILES['image']['size'] > $max_size) {
            set_flash('error', 'Error', 'Image must be under 2MB.');
            redirect(SITE_URL . "/pages/seller/product_form.php" . ($is_edit ? "?id=$edit_id" : ""));
        }

        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = ($is_edit ? "product_{$edit_id}" : 'product_new') . '_' . time() . '.' . $ext;
        if (!is_dir(UPLOAD_PATH)) {
            mkdir(UPLOAD_PATH, 0755, true);
        }
        $upload_path = UPLOAD_PATH . $filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_path)) {
            $image_path = UPLOAD_URL . $filename;
        }
    }

    try {
        if ($is_edit) {
            $stmt = $pdo->prepare('
                UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_path = ?, is_active = ?
                WHERE id = ? AND seller_id = ?
            ');
            $stmt->execute([$category_id, $name, $description, $price, $stock, $image_path, $is_active, $edit_id, $user_id]);
            set_flash('success', 'Updated', 'Product has been updated.');
        } else {
            $stmt = $pdo->prepare('
                INSERT INTO products (category_id, seller_id, name, description, price, stock, image_path, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([$category_id, $user_id, $name, $description, $price, $stock, $image_path, $is_active]);
            set_flash('success', 'Created', 'Product has been created.');
        }
        redirect(SITE_URL . '/pages/seller/products.php');
    } catch (PDOException $e) {
        set_flash('error', 'Error', 'Could not save product.');
        redirect(SITE_URL . "/pages/seller/product_form.php" . ($is_edit ? "?id=$edit_id" : ""));
    }
}

require_once __DIR__ . '/../../includes/header.php';
generate_csrf();
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading"><?= $is_edit ? 'Edit Product' : 'Add New Product' ?></h1>

    <div class="row justify-content-left">
        <div class="col-lg-8">
            <div class="card shadow-primary">
                <div class="card-body">
                    <form method="POST" enctype="multipart/form-data">
                        <?= csrf_field() ?>
                        <div class="mb-3">
                            <label for="category_id" class="form-label">Category</label>
                            <select class="form-select" id="category_id" name="category_id" required>
                                <option value="">Select Category</option>
                                <?php foreach ($categories as $cat): ?>
                                    <option value="<?= $cat['id'] ?>" <?= ($product['category_id'] ?? '') == $cat['id'] ? 'selected' : '' ?>>
                                        <?= sanitize($cat['name']) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="name" class="form-label">Product Name</label>
                            <input type="text" class="form-control" id="name" name="name"
                                   value="<?= sanitize($product['name'] ?? '') ?>" maxlength="200" required>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control" id="description" name="description" rows="4"><?= sanitize($product['description'] ?? '') ?></textarea>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="price" class="form-label">Price (PHP)</label>
                                <input type="number" class="form-control" id="price" name="price"
                                       value="<?= $product['price'] ?? '' ?>" step="0.01" min="0.01" max="999999.99" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="stock" class="form-label">Stock</label>
                                <input type="number" class="form-control" id="stock" name="stock"
                                       value="<?= $product['stock'] ?? '0' ?>" min="0" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="image" class="form-label">Product Image</label>
                            <input type="file" class="form-control" id="image" name="image" accept="image/jpeg,image/png,image/webp">
                            <?php if (!empty($product['image_path'])): ?>
                                <div class="mt-2">
                                    <img src="<?= sanitize(asset_url($product['image_path'])) ?>" alt="Current image" style="max-width: 200px;">
                                    <p class="small text-body mt-1">Current image</p>
                                </div>
                            <?php endif; ?>
                        </div>

                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="is_active" name="is_active" value="1"
                                       <?= ($product['is_active'] ?? 1) ? 'checked' : '' ?>>
                                <label class="form-check-label" for="is_active">
                                    Product is active (visible in shop)
                                </label>
                            </div>
                        </div>

                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">
                                <?= $is_edit ? 'Update Product' : 'Add Product' ?>
                            </button>
                            <a href="<?= SITE_URL ?>/pages/seller/products.php" class="btn btn-outline-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>
