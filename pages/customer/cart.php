<?php
$page_title = 'Shopping Cart';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/modules/CartModule.php';

require_role('customer');

$user_id = $_SESSION['user_id'];
$cart = new CartModule();

try {
    $stock_messages = $cart->reconcileStock($pdo, $user_id);
    foreach ($stock_messages as $message) {
        add_flash('warning', 'Cart Updated', $message);
    }

    $cart_items = $cart->getCart($pdo, $user_id);
    $subtotal = $cart->getCartSubtotal($cart_items);
} catch (PDOException $e) {
    $cart_items = [];
    $subtotal = 0;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf($_POST['csrf_token'] ?? '')) {
        set_flash('error', 'Error', 'Invalid CSRF token.');
        redirect($_SERVER['REQUEST_URI']);
    }

    if (isset($_POST['update'])) {
        $cart_item_id = (int)$_POST['cart_item_id'];
        $quantity = max(1, (int)$_POST['quantity']);

        try {
            $result = $cart->updateItem($pdo, $user_id, $cart_item_id, $quantity);
            if ($result['success']) {
                set_flash('success', 'Updated', 'Cart has been updated.');
            } else {
                set_flash('error', 'Error', $result['message']);
            }
        } catch (PDOException $e) {
            set_flash('error', 'Error', 'Could not update cart.');
        }
        redirect(SITE_URL . '/pages/customer/cart.php');

    } elseif (isset($_POST['remove'])) {
        $cart_item_id = (int)$_POST['cart_item_id'];

        $result = $cart->removeItem($pdo, $user_id, $cart_item_id);
        if ($result['success']) {
            set_flash('success', 'Removed', 'Item has been removed from cart.');
        } else {
            set_flash('error', 'Error', $result['message']);
        }
        redirect(SITE_URL . '/pages/customer/cart.php');
    }
}

require_once __DIR__ . '/../../includes/header.php';
generate_csrf();
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">Shopping Cart</h1>

    <?php if (empty($cart_items)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-cart3"></i></div>
            <h2 class="empty-state-title">Your cart is empty</h2>
            <p class="empty-state-text">Add some products to your cart to get started.</p>
            <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-primary">Start Shopping</a>
        </div>
    <?php else: ?>
        <div class="row">
            <div class="col-lg-8">
                <div class="card shadow-primary mb-4">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($cart_items as $item): ?>
                                        <tr>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <?php if ($item['image_path']): ?>
                                                        <img src="<?= sanitize(asset_url($item['image_path'])) ?>" alt="" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" class="me-3">
                                                    <?php else: ?>
                                                        <i class="bi bi-image text-muted me-3" style="font-size: 2rem;"></i>
                                                    <?php endif; ?>
                                                    <div>
                                                        <a href="<?= SITE_URL ?>/pages/customer/product_detail.php?id=<?= $item['product_id'] ?>" class="text-heading text-decoration-none">
                                                            <?= sanitize($item['name']) ?>
                                                        </a>
                                                        <?php if ($item['quantity'] > $item['stock']): ?>
                                                            <div class="text-danger small">Only <?= $item['stock'] ?> available</div>
                                                        <?php endif; ?>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><?= format_currency($item['price']) ?></td>
                                            <td>
                                                <form method="POST" class="d-flex align-items-center gap-2">
                                                    <?= csrf_field() ?>
                                                    <input type="hidden" name="cart_item_id" value="<?= $item['cart_item_id'] ?>">
                                                    <input type="number" name="quantity" value="<?= $item['quantity'] ?>"
                                                           min="1" max="<?= $item['stock'] ?>" class="form-control" style="width: 70px;">
                                                    <button type="submit" name="update" class="btn btn-sm btn-outline-primary">Update</button>
                                                </form>
                                            </td>
                                            <td><?= format_currency($item['subtotal']) ?></td>
                                            <td>
                                                <form method="POST">
                                                    <?= csrf_field() ?>
                                                    <input type="hidden" name="cart_item_id" value="<?= $item['cart_item_id'] ?>">
                                                    <button type="submit" name="remove" class="btn btn-sm btn-outline-danger">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <a href="<?= SITE_URL ?>/pages/customer/shop.php" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left"></i> Continue Shopping
                </a>
            </div>

            <div class="col-lg-4">
                <div class="card shadow-primary">
                    <div class="card-header bg-white">
                        <h3 class="h5 mb-0 text-heading">Order Summary</h3>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-body">Subtotal</span>
                            <span class="text-heading"><?= format_currency($subtotal) ?></span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-body">Shipping</span>
                            <span class="text-heading">Free</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <strong class="text-heading">Total</strong>
                            <strong class="text-heading"><?= format_currency($subtotal) ?></strong>
                        </div>
                        <?php
                        $has_stock_issues = false;
                        foreach ($cart_items as $item) {
                            if ($item['quantity'] > $item['stock']) {
                                $has_stock_issues = true;
                                break;
                            }
                        }
                        ?>
                        <?php if ($has_stock_issues): ?>
                            <div class="alert alert-warning mb-3">
                                Some items have stock issues. Please update quantities before checkout.
                            </div>
                        <?php endif; ?>
                        <a href="<?= SITE_URL ?>/pages/customer/checkout.php" class="btn btn-primary w-100<?= $has_stock_issues ? ' disabled' : '' ?>">
                            Proceed to Checkout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>
