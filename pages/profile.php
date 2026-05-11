<?php
$page_title = 'Profile';
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

require_auth();

$csrf_token = generate_csrf();

try {
    $stmt = $pdo->prepare('SELECT id, username, email, role, profile_image, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    $user = null;
}

if (!$user) {
    set_flash('error', 'Error', 'User not found');
    redirect('/');
}

$username_parts = trim($user['username']);
if (strpos($username_parts, ' ') !== false) {
    $parts = explode(' ', $username_parts);
    $initials = strtoupper(substr($parts[0], 0, 1)) . strtoupper(substr($parts[count($parts) - 1], 0, 1));
} else {
    $initials = strtoupper(substr($username_parts, 0, 2));
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">My Profile</h1>

    <div class="row">
        <div class="col-md-4">
            <div class="card shadow-primary">
                <div class="card-body text-center">
                    <div class="user-avatar-large mb-3" data-username="<?= sanitize($user['username']) ?>" data-profile-image="<?= sanitize(asset_url($user['profile_image'] ?? '')) ?>"></div>
                    <h5 class="mb-1"><?= sanitize($user['username']) ?></h5>
                    <p class="text-muted mb-3"><?= ucfirst($user['role']) ?></p>
                    
                    <form id="profileImageForm" enctype="multipart/form-data" class="profile-upload-form">
                        <input type="hidden" name="csrf_token" value="<?= sanitize($csrf_token) ?>">
                        <div class="mb-3">
                            <label for="profileImageInput" class="form-label">Change Photo</label>
                            <input type="file" class="form-control form-control-sm" id="profileImageInput" name="profile_image" accept="image/jpeg,image/png,image/webp" required>
                            <div class="form-text">JPG, PNG or WebP. Max 2MB.</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-sm">
                            <i class="bi bi-upload"></i> Upload
                        </button>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="col-md-8">
            <div class="card shadow-primary mb-4">
                <div class="card-body">
                    <h5 class="card-title mb-4">Profile Information</h5>

                    <form id="profileInfoForm">
                        <input type="hidden" name="csrf_token" value="<?= sanitize($csrf_token) ?>">
                        <input type="hidden" name="current_password" value="">
                        <input type="hidden" name="new_password" value="">
                        <input type="hidden" name="confirm_password" value="">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="profileUsername" class="form-label">Username</label>
                                <input type="text" class="form-control" id="profileUsername" name="username" value="<?= sanitize($user['username']) ?>" minlength="3" maxlength="50" required>
                            </div>
                            <div class="col-md-6">
                                <label for="profileEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="profileEmail" name="email" value="<?= sanitize($user['email']) ?>" required>
                            </div>
                        </div>

                        <div class="row mb-4">
                            <div class="col-md-6">
                                <label class="form-label">Role</label>
                                <input type="text" class="form-control" value="<?= ucfirst($user['role']) ?>" disabled>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Member Since</label>
                                <input type="text" class="form-control" value="<?= date('M d, Y', strtotime($user['created_at'])) ?>" disabled>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-check2"></i> Save Profile
                        </button>
                    </form>
                </div>
            </div>

            <div class="card shadow-primary">
                <div class="card-body">
                    <h5 class="card-title mb-4">Change Password</h5>

                    <form id="passwordForm">
                        <input type="hidden" name="csrf_token" value="<?= sanitize($csrf_token) ?>">
                        <input type="hidden" name="username" value="<?= sanitize($user['username']) ?>">
                        <input type="hidden" name="email" value="<?= sanitize($user['email']) ?>">
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <label for="currentPassword" class="form-label">Current Password</label>
                                <input type="password" class="form-control" id="currentPassword" name="current_password" autocomplete="current-password" required>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="newPassword" class="form-label">New Password</label>
                                <input type="password" class="form-control" id="newPassword" name="new_password" minlength="8" autocomplete="new-password" required>
                            </div>
                            <div class="col-md-6">
                                <label for="confirmPassword" class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" id="confirmPassword" name="confirm_password" minlength="8" autocomplete="new-password" required>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-outline-primary">
                            <i class="bi bi-key"></i> Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function submitProfileForm(form, button, successTitle, onSuccess) {
    var originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = 'Saving...';

    fetch('<?= SITE_URL ?>/api/profile_update.php', {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (!data.success) {
            throw new Error(data.message || 'Could not update profile.');
        }

        Swal.fire({
            icon: 'success',
            title: successTitle,
            text: data.message,
            confirmButtonColor: '#533afd'
        });

        if (typeof onSuccess === 'function') {
            onSuccess();
        }
    })
    .catch(function(error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Please try again.',
            confirmButtonColor: '#533afd'
        });
    })
    .finally(function() {
        button.disabled = false;
        button.innerHTML = originalText;
    });
}

document.getElementById('profileInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var form = this;
    var button = form.querySelector('[type="submit"]');

    submitProfileForm(form, button, 'Profile Updated', function() {
        var username = form.querySelector('[name="username"]').value;
        var email = form.querySelector('[name="email"]').value;
        document.querySelectorAll('[data-username]').forEach(function(el) {
            el.dataset.username = username;
        });
        document.querySelector('.card-body h5').textContent = username;
        document.querySelectorAll('.user-menu-name').forEach(function(el) {
            el.textContent = username;
        });
        document.querySelector('#passwordForm input[name="username"]').value = username;
        document.querySelector('#passwordForm input[name="email"]').value = email;
        document.querySelectorAll('.user-avatar-small, .user-avatar-large').forEach(function(el) {
            if (!el.dataset.profileImage) {
                el.innerHTML = '<span class="initials">' + username.substring(0, 2).toUpperCase() + '</span>';
            }
        });
    });
});

document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var form = this;
    var button = form.querySelector('[type="submit"]');

    submitProfileForm(form, button, 'Password Updated', function() {
        form.reset();
        document.querySelector('#passwordForm input[name="username"]').value = document.querySelector('#profileUsername').value;
        document.querySelector('#passwordForm input[name="email"]').value = document.querySelector('#profileEmail').value;
    });
});

document.getElementById('profileImageForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var form = this;
    var button = form.querySelector('[type="submit"]');
    var originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = 'Uploading...';

    fetch('<?= SITE_URL ?>/api/profile_image_upload.php', {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (!data.success) {
            throw new Error(data.message || 'Upload failed.');
        }

        document.querySelectorAll('.user-avatar-small, .user-avatar-large').forEach(function(avatar) {
            avatar.dataset.profileImage = data.profile_image;
            avatar.innerHTML = '<img src="' + data.profile_image + '" alt="Profile" class="profile-image-img">';
        });

        form.reset();
        Swal.fire({
            icon: 'success',
            title: 'Profile Photo Updated',
            text: data.message,
            confirmButtonColor: '#533afd'
        });
    })
    .catch(function(error) {
        Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error.message || 'Please try again.',
            confirmButtonColor: '#533afd'
        });
    })
    .finally(function() {
        button.disabled = false;
        button.innerHTML = originalText;
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
