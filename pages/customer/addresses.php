<?php
$page_title = 'My Addresses';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

require_role('customer');

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf($_POST['csrf_token'] ?? '')) {
        set_flash('error', 'Error', 'Invalid CSRF token.');
        redirect($_SERVER['REQUEST_URI']);
    }

    if (isset($_POST['add_address'])) {
        $full_name = trim($_POST['full_name'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $address = trim($_POST['address'] ?? '');
        $set_default = isset($_POST['set_default']);

        $errors = [];
        if (empty($full_name) || strlen($full_name) < 2 || strlen($full_name) > 100) {
            $errors[] = 'Full name must be 2-100 characters.';
        }
        if (empty($phone) || !preg_match('/^[\d\s\+\-\(\)]{5,20}$/', $phone)) {
            $errors[] = 'Valid phone number is required.';
        }
        if (empty($address) || strlen($address) < 10 || strlen($address) > 500) {
            $errors[] = 'Address must be 10-500 characters.';
        }

        if (!empty($errors)) {
            foreach ($errors as $error) {
                set_flash('error', 'Validation Error', $error);
            }
            redirect(SITE_URL . '/pages/customer/addresses.php');
        }

        try {
            if ($set_default) {
                $pdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')->execute([$user_id]);
            }

            $stmt = $pdo->prepare('INSERT INTO addresses (user_id, full_name, phone, address, is_default) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$user_id, $full_name, $phone, $address, $set_default ? 1 : 0]);

            set_flash('success', 'Added', 'Address has been added.');
        } catch (PDOException $e) {
            set_flash('error', 'Error', 'Could not add address.');
        }
        redirect(SITE_URL . '/pages/customer/addresses.php');

    } elseif (isset($_POST['delete_address'])) {
        $address_id = (int)$_POST['address_id'];

        try {
            $stmt = $pdo->prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?');
            $stmt->execute([$address_id, $user_id]);
            set_flash('success', 'Deleted', 'Address has been deleted.');
        } catch (PDOException $e) {
            set_flash('error', 'Error', 'Could not delete address.');
        }
        redirect(SITE_URL . '/pages/customer/addresses.php');

    } elseif (isset($_POST['set_default'])) {
        $address_id = (int)$_POST['address_id'];

        try {
            $pdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')->execute([$user_id]);
            $pdo->prepare('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?')->execute([$address_id, $user_id]);
            set_flash('success', 'Updated', 'Default address has been updated.');
        } catch (PDOException $e) {
            set_flash('error', 'Error', 'Could not update default address.');
        }
        redirect(SITE_URL . '/pages/customer/addresses.php');
    }
}

try {
    $addresses = $pdo->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
    $addresses->execute([$user_id]);
    $addresses = $addresses->fetchAll();
} catch (PDOException $e) {
    $addresses = [];
}

require_once __DIR__ . '/../../includes/header.php';
generate_csrf();
?>

<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h2 text-heading mb-0">My Addresses</h1>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAddressModal">
            <i class="bi bi-plus"></i> Add Address
        </button>
    </div>

    <?php if (empty($addresses)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-geo-alt"></i></div>
            <h2 class="empty-state-title">No addresses saved</h2>
            <p class="empty-state-text">Add an address to speed up your checkout.</p>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAddressModal">
                Add Address
            </button>
        </div>
    <?php else: ?>
        <div class="row">
            <?php foreach ($addresses as $addr): ?>
                <div class="col-md-6 mb-3">
                    <div class="card shadow-primary h-100 <?= $addr['is_default'] ? 'border-primary' : '' ?>">
                        <div class="card-body">
                            <?php if ($addr['is_default']): ?>
                                <span class="badge badge-success mb-2">Default</span>
                            <?php endif; ?>
                            <h5 class="card-title text-heading"><?= sanitize($addr['full_name']) ?></h5>
                            <p class="card-text text-body mb-1"><?= sanitize($addr['phone']) ?></p>
                            <p class="card-text text-body"><?= nl2br(sanitize($addr['address'])) ?></p>
                            <div class="d-flex gap-2">
                                <?php if (!$addr['is_default']): ?>
                                    <form method="POST">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="address_id" value="<?= $addr['id'] ?>">
                                        <button type="submit" name="set_default" class="btn btn-sm btn-outline-primary">Set as Default</button>
                                    </form>
                                <?php endif; ?>
                                <form method="POST" onsubmit="return confirm('Delete this address?');">
                                    <?= csrf_field() ?>
                                    <input type="hidden" name="address_id" value="<?= $addr['id'] ?>">
                                    <button type="submit" name="delete_address" class="btn btn-sm btn-outline-danger">Delete</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<div class="modal fade" id="addAddressModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title text-heading">Add New Address</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST">
                <?= csrf_field() ?>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="full_name" class="form-label">Full Name</label>
                        <input type="text" class="form-control" id="full_name" name="full_name" required>
                    </div>
                    <div class="mb-3">
                        <label for="phone" class="form-label">Phone</label>
                        <input type="text" class="form-control" id="phone" name="phone" required>
                    </div>
                    <div class="mb-3">
                        <label for="address" class="form-label">Address</label>
                        <textarea class="form-control" id="address" name="address" rows="3" required></textarea>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="set_default" name="set_default">
                        <label class="form-check-label" for="set_default">
                            Set as default address
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" name="add_address" class="btn btn-primary">Add Address</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>