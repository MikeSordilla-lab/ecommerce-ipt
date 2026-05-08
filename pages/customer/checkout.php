<?php
$page_title = 'Checkout';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_role('customer');

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare('
        SELECT ci.*, p.name, p.price, p.stock, p.image_path
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
    ');
    $stmt->execute([$user_id]);
    $cart_items = $stmt->fetchAll();

    $subtotal = array_reduce($cart_items, function($sum, $item) {
        return $sum + ($item['price'] * $item['quantity']);
    }, 0);

    $addresses = $pdo->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
    $addresses->execute([$user_id]);
    $addresses = $addresses->fetchAll();
} catch (PDOException $e) {
    $cart_items = [];
    $addresses = [];
    $subtotal = 0;
}

if (empty($cart_items)) {
    set_flash('warning', 'Empty Cart', 'Your cart is empty.');
    redirect(SITE_URL . '/pages/customer/cart.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf($_POST['csrf_token'] ?? '')) {
        set_flash('error', 'Error', 'Invalid CSRF token.');
        redirect($_SERVER['REQUEST_URI']);
    }

    $full_name = trim($_POST['full_name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $save_address = isset($_POST['save_address']);
    $notes = trim($_POST['notes'] ?? '');

    $errors = [];
    if (empty($full_name) || strlen($full_name) < 2 || strlen($full_name) > 100) {
        $errors[] = 'Full name must be 2-100 characters.';
    }
    if (empty($phone) || !preg_match('/^[\d\s\+\-\(\)]{5,20}$/', $phone)) {
        $errors[] = 'Valid phone number is required (5-20 characters).';
    }
    if (empty($address) || strlen($address) < 10 || strlen($address) > 500) {
        $errors[] = 'Address must be 10-500 characters.';
    }

    foreach ($cart_items as $item) {
        if ($item['quantity'] > $item['stock']) {
            $errors[] = "Not enough stock for {$item['name']}. Only {$item['stock']} available.";
        }
    }

    if (!empty($errors)) {
        foreach ($errors as $error) {
            set_flash('error', 'Validation Error', $error);
        }
        redirect(SITE_URL . '/pages/customer/checkout.php');
    }

    $shipping_address = json_encode([
        'full_name' => $full_name,
        'phone' => $phone,
        'address' => $address
    ]);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('
            INSERT INTO orders (user_id, total, status, payment_method, shipping_address, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$user_id, $subtotal, 'pending', 'COD', $shipping_address, $notes]);
        $order_id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('
            INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase)
            VALUES (?, ?, ?, ?, ?)
        ');
        foreach ($cart_items as $item) {
            $stmt->execute([$order_id, $item['product_id'], $item['name'], $item['quantity'], $item['price']]);

            $update_stock = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
            $update_stock->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
        }

        $clear_cart = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?');
        $clear_cart->execute([$user_id]);

        if ($save_address) {
            $default_address = $pdo->prepare('SELECT id FROM addresses WHERE user_id = ? AND is_default = 1');
            $default_address->execute([$user_id]);
            $has_default = $default_address->fetch();

            $stmt = $pdo->prepare('INSERT INTO addresses (user_id, full_name, phone, address, is_default) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$user_id, $full_name, $phone, $address, $has_default ? 0 : 1]);
        }

        $pdo->commit();

        set_flash('success', 'Order Placed!', "Your order #$order_id has been placed successfully.");
        redirect(SITE_URL . '/pages/customer/order_detail.php?id=' . $order_id);

    } catch (PDOException $e) {
        $pdo->rollBack();
        set_flash('error', 'Error', 'Could not place order. Please try again.');
        redirect(SITE_URL . '/pages/customer/checkout.php');
    }
}

require_once __DIR__ . '/../../includes/header.php';
generate_csrf();
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">Checkout</h1>

    <form method="POST">
        <?= csrf_field() ?>
        <div class="row">
            <div class="col-lg-8">
                <div class="card shadow-primary mb-4">
                    <div class="card-header bg-white">
                        <h3 class="h5 mb-0 text-heading">Shipping Address</h3>
                    </div>
                    <div class="card-body">
                        <?php if (!empty($addresses)): ?>
                            <div class="mb-3">
                                <label class="form-label">Saved Addresses</label>
                                <?php foreach ($addresses as $addr): ?>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="radio" name="saved_address" value="<?= $addr['id'] ?>"
                                               id="addr_<?= $addr['id'] ?>" data-address="<?= htmlspecialchars(json_encode([
                                                    'full_name' => $addr['full_name'],
                                                    'phone' => $addr['phone'],
                                                    'address' => $addr['address']
                                                ]), ENT_QUOTES, 'UTF-8') ?>">
                                        <label class="form-check-label" for="addr_<?= $addr['id'] ?>">
                                            <?= sanitize($addr['full_name']) ?> - <?= sanitize(substr($addr['address'], 0, 50)) ?>...
                                        </label>
                                    </div>
                                <?php endforeach; ?>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="saved_address" value="new" id="addr_new" checked>
                                    <label class="form-check-label" for="addr_new">Use a new address</label>
                                </div>
                            </div>
                        <?php endif; ?>

                        <div class="row g-3" id="new_address_fields">
                            <div class="col-md-6">
                                <label for="full_name" class="form-label">Full Name</label>
                                <input type="text" class="form-control" id="full_name" name="full_name"
                                       value="<?= sanitize($_POST['full_name'] ?? '') ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label for="phone" class="form-label">Phone</label>
                                <input type="text" class="form-control" id="phone" name="phone"
                                       value="<?= sanitize($_POST['phone'] ?? '') ?>" required>
                            </div>
                            <div class="col-12">
                                <label for="address" class="form-label">Address</label>
                                <textarea class="form-control" id="address" name="address" rows="3" required><?= sanitize($_POST['address'] ?? '') ?></textarea>
                            </div>
                            <div class="col-12">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="save_address" name="save_address">
                                    <label class="form-check-label" for="save_address">
                                        Save this address for future orders
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-primary mb-4">
                    <div class="card-header bg-white">
                        <h3 class="h5 mb-0 text-heading">Order Notes (Optional)</h3>
                    </div>
                    <div class="card-body">
                        <textarea class="form-control" name="notes" rows="2" placeholder="Any special instructions..."></textarea>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card shadow-primary">
                    <div class="card-header bg-white">
                        <h3 class="h5 mb-0 text-heading">Order Summary</h3>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <?php foreach ($cart_items as $item): ?>
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-body"><?= sanitize($item['name']) ?> x <?= $item['quantity'] ?></span>
                                    <span class="text-heading">$<?= number_format($item['price'] * $item['quantity'], 2) ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-body">Subtotal</span>
                            <span class="text-heading">$<?= number_format($subtotal, 2) ?></span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-body">Shipping</span>
                            <span class="text-heading">Free</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <strong class="text-heading">Total</strong>
                            <strong class="text-heading">$<?= number_format($subtotal, 2) ?></strong>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 btn-lg">
                            <i class="bi bi-credit-card"></i> Place Order
                        </button>
                        <p class="text-body small text-center mt-2 mb-0">Cash on Delivery</p>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

<script>
document.querySelectorAll('input[name="saved_address"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        var fields = document.getElementById('new_address_fields');
        if (this.value === 'new') {
            fields.style.display = 'block';
        } else {
            fields.style.display = 'none';
        }
    });
});
</script>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>