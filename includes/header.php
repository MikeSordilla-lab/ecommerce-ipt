<?php
$current_page = basename($_SERVER["PHP_SELF"]);
$is_logged_in = is_logged_in();
$user_role = get_user_role();
$username = get_logged_in_username();
$profile_image = "";

if ($is_logged_in) {
    try {
        $profile_stmt = $pdo->prepare(
            "SELECT profile_image FROM users WHERE id = ?",
        );
        $profile_stmt->execute([$_SESSION["user_id"]]);
        $profile_image = $profile_stmt->fetchColumn() ?: "";
    } catch (PDOException $e) {
        $profile_image = "";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= htmlspecialchars(
        $_SESSION["csrf_token"] ?? "",
    ) ?>">
    <title><?php echo (isset($page_title)
        ? sanitize($page_title) . " - "
        : "") . SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="<?= SITE_URL ?>/css/styles.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-light d-flex align-items-center" href="<?= SITE_URL ?>">
                <span class="brand-icon"><i class="bi bi-bag"></i></span>
                <span><?= SITE_NAME ?></span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-lg-center">
                    <?php if ($is_logged_in): ?>
                        <?php if ($user_role === "customer"): ?>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "shop.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/customer/shop.php">
                                    <i class="bi bi-shop"></i> Shop
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "cart.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/customer/cart.php">
                                    <i class="bi bi-cart3"></i> Cart
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "orders.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/customer/orders.php">
                                    <i class="bi bi-box-seam"></i> Orders
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "addresses.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/customer/addresses.php">
                                    <i class="bi bi-geo-alt"></i> Addresses
                                </a>
                            </li>
                        <?php elseif ($user_role === "seller"): ?>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "dashboard.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/seller/dashboard.php">
                                    <i class="bi bi-speedometer2"></i> Dashboard
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "products.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/seller/products.php">
                                    <i class="bi bi-box"></i> Products
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "orders.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/seller/orders.php">
                                    <i class="bi bi-box-seam"></i> Orders
                                </a>
                            </li>
                        <?php elseif ($user_role === "admin"): ?>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "dashboard.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/admin/dashboard.php">
                                    <i class="bi bi-speedometer2"></i> Dashboard
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "users.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/admin/users.php">
                                    <i class="bi bi-people"></i> Users
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "products.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/admin/products.php">
                                    <i class="bi bi-box"></i> Products
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "orders.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/admin/orders.php">
                                    <i class="bi bi-box-seam"></i> Orders
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link <?= $current_page ===
                                "profile.php"
                                    ? "active"
                                    : "" ?>" href="<?= SITE_URL ?>/pages/profile.php">
                                    <i class="bi bi-gear"></i> Profile
                                </a>
                            </li>
                        <?php endif; ?>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle user-menu-link" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                                <span class="user-avatar-small" data-username="<?= sanitize(
                                    $username,
                                ) ?>" data-profile-image="<?= sanitize(
    asset_url($profile_image),
) ?>"></span>
                                <span class="user-menu-name"><?= sanitize(
                                    $username,
                                ) ?></span>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="<?= SITE_URL ?>/pages/profile.php">
                                    <i class="bi bi-person"></i> My Profile
                                </a></li>
                                <li><a class="dropdown-item" href="<?= SITE_URL ?>/pages/auth/logout.php">
                                    <i class="bi bi-box-arrow-right"></i> Logout
                                </a></li>
                            </ul>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link <?= $current_page === "login.php"
                                ? "active"
                                : "" ?>" href="<?= SITE_URL ?>/pages/auth/login.php">
                                <i class="bi bi-box-arrow-in-right"></i> Login
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link <?= $current_page ===
                            "register.php"
                                ? "active"
                                : "" ?>" href="<?= SITE_URL ?>/pages/auth/register.php">
                                <i class="bi bi-person-plus"></i> Register
                            </a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>

    <?php
    $flash_messages = [];
    if (isset($_SESSION["flash"])) {
        $flash_messages[] = $_SESSION["flash"];
        unset($_SESSION["flash"]);
    }
    if (isset($_SESSION["flashes"]) && is_array($_SESSION["flashes"])) {
        $flash_messages = array_merge($flash_messages, $_SESSION["flashes"]);
        unset($_SESSION["flashes"]);
    }
    ?>
    <?php if (!empty($flash_messages)): ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var flashMessages = <?= json_encode(
            $flash_messages,
            JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT,
        ) ?>;

        if (flashMessages.length === 1) {
            Swal.fire({
                icon: flashMessages[0].type,
                title: flashMessages[0].title,
                text: flashMessages[0].message,
                confirmButtonColor: '#533afd'
            });
            return;
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function(character) {
                return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character];
            });
        }

        Swal.fire({
            icon: 'error',
            title: 'Please review the following',
            html: '<ul class="text-start mb-0">' + flashMessages.map(function(message) {
                return '<li><strong>' + escapeHtml(message.title) + ':</strong> ' + escapeHtml(message.message) + '</li>';
            }).join('') + '</ul>',
            confirmButtonColor: '#533afd'
        });
    });
    </script>
    <?php endif; ?>

    <main class="py-4">

<script>
(function() {
    function getInitials(username) {
        if (!username) return '?';
        var parts = username.trim().split(/\s+/);
        if (parts.length >= 2) {
            return parts[0][0] + parts[parts.length - 1][0];
        }
        return username.substring(0, 2);
    }

    function renderAvatar(el) {
        var username = el.dataset.username || '';
        var profileImage = el.dataset.profileImage || '';
        var initials = getInitials(username);

        if (profileImage && profileImage.trim() !== '') {
            el.innerHTML = '<img src="' + profileImage + '" alt="Avatar" class="profile-image-img">';
        } else {
            el.innerHTML = '<span class="initials">' + initials.toUpperCase() + '</span>';
        }
    }

    document.querySelectorAll('.user-avatar-small, .user-avatar-tiny, .user-avatar-large').forEach(renderAvatar);
})();
</script>
