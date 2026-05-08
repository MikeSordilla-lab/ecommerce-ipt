<?php
$page_title = 'Profile';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

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

require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container">
    <h1 class="h2 mb-4 text-heading">My Profile</h1>

    <div class="row">
        <div class="col-md-4">
            <div class="card shadow-primary">
                <div class="card-body text-center">
                    <div class="user-avatar-large mb-3" data-username="<?= sanitize($user['username']) ?>" data-profile-image="<?= sanitize($user['profile_image'] ?? '') ?>"></div>
                    <h5 class="mb-1"><?= sanitize($user['username']) ?></h5>
                    <p class="text-muted mb-3"><?= ucfirst($user['role']) ?></p>
                    
                    <form id="profileImageForm" enctype="multipart/form-data" class="profile-upload-form">
                        <input type="hidden" name="csrf_token" value="<?= sanitize($csrf_token) ?>">
                        <div class="mb-3">
                            <label for="profileImageInput" class="form-label">Change Photo</label>
                            <input type="file" class="form-control form-control-sm" id="profileImageInput" name="profile_image" accept="image/jpeg,image/png,image/webp">
                            <div class="form-text">JPG, PNG or WebP. Max 2MB.</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-sm">
                            <i class="bi bi-upload"></i> Upload
                        </button>
                    </form>
                    <div id="uploadMessage" class="mt-2"></div>
                </div>
            </div>
        </div>
        
        <div class="col-md-8">
            <div class="card shadow-primary">
                <div class="card-body">
                    <h5 class="card-title mb-4">Profile Information</h5>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" value="<?= sanitize($user['username']) ?>" disabled>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" value="<?= sanitize($user['email']) ?>" disabled>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Role</label>
                            <input type="text" class="form-control" value="<?= ucfirst($user['role']) ?>" disabled>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Member Since</label>
                            <input type="text" class="form-control" value="<?= date('M d, Y', strtotime($user['created_at'])) ?>" disabled>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('profileImageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var formData = new FormData(this);
    var messageDiv = document.getElementById('uploadMessage');
    
    messageDiv.innerHTML = '<span class="text-muted">Uploading...</span>';
    
    fetch('<?= SITE_URL ?>/api/profile_image_upload.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageDiv.innerHTML = '<span class="text-success">Image uploaded!</span>';
            var avatar = document.querySelector('.user-avatar-large');
            avatar.dataset.profileImage = data.profile_image;
            if (avatar.querySelector('.initials')) {
                avatar.innerHTML = '<img src="' + data.profile_image + '" alt="Profile" class="profile-image-img">';
            }
        } else {
            messageDiv.innerHTML = '<span class="text-danger">' + data.message + '</span>';
        }
    })
    .catch(error => {
        messageDiv.innerHTML = '<span class="text-danger">Upload failed</span>';
    });
});
</script>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>