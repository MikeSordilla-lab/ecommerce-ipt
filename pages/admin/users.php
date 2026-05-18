<?php
$page_title = "User Management";
require_once __DIR__ . "/../../includes/config.php";
require_once __DIR__ . "/../../includes/functions.php";
require_once __DIR__ . "/../../includes/auth.php";
require_role("admin");

$csrf_token = generate_csrf();

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["approve_seller"])) {
    if (!validate_csrf($_POST["csrf_token"] ?? "")) {
        set_flash("error", "Error", "Invalid token");
        redirect(SITE_URL . "/pages/admin/users.php");
    }

    $seller_id = (int) ($_POST["user_id"] ?? 0);

    try {
        $stmt = $pdo->prepare(
            'UPDATE users SET is_approved = 1 WHERE id = ? AND role = "seller"',
        );
        $stmt->execute([$seller_id]);
        set_flash("success", "Approved", "Seller has been approved.");
    } catch (PDOException $e) {
        set_flash("error", "Error", "Could not approve seller.");
    }

    redirect(SITE_URL . "/pages/admin/users.php");
}

try {
    $users = $pdo
        ->query("SELECT * FROM users ORDER BY created_at DESC")
        ->fetchAll();
} catch (PDOException $e) {
    $users = [];
}

require_once __DIR__ . "/../../includes/header.php";
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">User Management</h1>

    <?php if (empty($users)): ?>
        <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-people"></i></div>
            <h2 class="empty-state-title">No users found</h2>
            <p class="empty-state-text">No users have registered yet.</p>
        </div>
    <?php else: ?>
        <div class="card shadow-primary">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Registered</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                                <?php
                                $can_modify =
                                    $user["id"] !== $_SESSION["user_id"];
                                $stmt = $pdo->prepare(
                                    "SELECT COUNT(*) FROM orders WHERE user_id = ?",
                                );
                                $stmt->execute([$user["id"]]);
                                $has_orders = $stmt->fetchColumn() > 0;
                                ?>
                                <tr>
                                    <td><?= sanitize($user["username"]) ?></td>
                                    <td><?= sanitize($user["email"]) ?></td>
                                    <td><span class="badge badge-<?= $user[
                                        "role"
                                    ] === "admin"
                                        ? "info"
                                        : ($user["role"] === "seller"
                                            ? "warning"
                                            : "success") ?>">
                                        <?= ucfirst($user["role"]) ?>
                                    </span></td>
                                    <td>
                                        <?php if (
                                            $user["role"] === "seller" &&
                                            !$user["is_approved"]
                                        ): ?>
                                            <span class="badge badge-warning">Pending</span>
                                        <?php else: ?>
                                            <span class="badge badge-success">Approved</span>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= date(
                                        "M d, Y",
                                        strtotime($user["created_at"]),
                                    ) ?></td>
                                    <td class="actions-cell">
                                        <div class="action-buttons">
                                        <?php if (
                                            $user["role"] === "seller" &&
                                            !$user["is_approved"]
                                        ): ?>
                                            <form method="POST" class="d-inline">
                                                <input type="hidden" name="csrf_token" value="<?= sanitize(
                                                    $csrf_token,
                                                ) ?>">
                                                <input type="hidden" name="user_id" value="<?= (int) $user[
                                                    "id"
                                                ] ?>">
                                                <input type="hidden" name="approve_seller" value="1">
                                                <button type="submit" class="icon-btn icon-btn-success no-loading" aria-label="Approve seller" title="Approve">
                                                    <i class="bi bi-person-check" aria-hidden="true"></i>
                                                    <span class="sr-only">Approve</span>
                                                </button>
                                            </form>
                                        <?php endif; ?>

                                        <?php if ($can_modify): ?>
                                            <form method="POST" action="<?= SITE_URL ?>/api/user_update.php" class="role-form">
                                                <input type="hidden" name="csrf_token" value="<?= sanitize(
                                                    $csrf_token,
                                                ) ?>">
                                                <input type="hidden" name="user_id" value="<?= $user[
                                                    "id"
                                                ] ?>">
                                                <select name="role" class="form-select form-select-sm role-select" onchange="submitRoleForm(this)">
                                                    <option value="">Change Role</option>
                                                    <option value="admin" <?= $user[
                                                        "role"
                                                    ] === "admin"
                                                        ? "selected"
                                                        : "" ?>>Admin</option>
                                                    <option value="seller" <?= $user[
                                                        "role"
                                                    ] === "seller"
                                                        ? "selected"
                                                        : "" ?>>Seller</option>
                                                    <option value="customer" <?= $user[
                                                        "role"
                                                    ] === "customer"
                                                        ? "selected"
                                                        : "" ?>>Customer</option>
                                                </select>
                                            </form>

                                            <?php if ($has_orders): ?>
                                                <button type="button" class="icon-btn icon-btn-danger" disabled aria-label="Cannot delete user with orders" title="Cannot delete user with orders">
                                                    <i class="bi bi-trash3" aria-hidden="true"></i>
                                                    <span class="sr-only">Delete</span>
                                                </button>
                                            <?php else: ?>
                                                <form method="POST" action="<?= SITE_URL ?>/api/user_update.php" class="delete-form" onsubmit="return confirmDelete(this)">
                                                    <input type="hidden" name="csrf_token" value="<?= sanitize(
                                                        $csrf_token,
                                                    ) ?>">
                                                    <input type="hidden" name="user_id" value="<?= $user[
                                                    "id"
                                                ] ?>">
                                                    <input type="hidden" name="delete" value="1">
                                                    <button type="submit" class="icon-btn icon-btn-danger no-loading" aria-label="Delete user" title="Delete">
                                                        <i class="bi bi-trash3" aria-hidden="true"></i>
                                                        <span class="sr-only">Delete</span>
                                                    </button>
                                                </form>
                                            <?php endif; ?>
                                        <?php else: ?>
                                            <span class="text-muted small">Current User</span>
                                        <?php endif; ?>
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

<script>
function submitRoleForm(select) {
    var form = select.closest('.role-form');
    var formData = new FormData(form);
    var newRole = select.value;

    if (!newRole) return;

    fetch('<?= SITE_URL ?>/api/user_update.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('success', 'Success', data.message);
            setTimeout(function() {
                window.location.reload();
            }, 1000);
        } else {
            showToast('error', 'Error', data.message);
            select.value = '';
        }
    })
    .catch(error => {
        showToast('error', 'Error', 'An error occurred');
        select.value = '';
    });
}

function confirmDelete(form) {
    return confirm('Are you sure you want to delete this user?');
}

function showToast(type, title, message) {
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<strong>' + title + '</strong><br>' + message;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:15px 20px;background:' + (type === 'success' ? '#28a745' : '#dc3545') + ';color:white;border-radius:4px;box-shadow:0 2px 5px rgba(0,0,0,0.2)';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.remove();
    }, 3000);
}
</script>

<?php require_once __DIR__ . "/../../includes/footer.php"; ?>
