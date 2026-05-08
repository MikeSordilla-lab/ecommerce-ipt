# 019 — Enhancement: Profile Images + Initials Avatars (All Roles)

## Parent

PRD: E-commerce Platform Fixes & Enhancements (`PRD.md` at repo root)

## What to build

Add profile image upload capability, display initials-based avatars as fallbacks, and show profile pictures in the admin user management table.

**End-to-end behavior:**
- **Database**: run `ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL DEFAULT NULL AFTER email;` via a migration or direct SQL.
- **Upload endpoint `api/profile_image_upload.php`** — POST accepts `profile_image` file (multipart/form-data). Validate: allowed types JPG/PNG/WebP, max 2MB, MIME type check server-side. If valid, save to `uploads/profiles/` with pattern `user_{user_id}_{timestamp}.{ext}`. Insert/update `profile_image` column in `users` table. Return JSON `{success, profile_image_url, message}`.
- **`pages/profile.php`** — add a profile image upload section (file input + current image preview + upload button). Show either uploaded image or initials-based circle avatar.
- **Initials avatar component** — when `profile_image` is null, render a circle with the user's initials (first + last initial from username, e.g. "JD" for "John Doe") on a purple background `#533afd`. CSS: `border-radius: 50%`, fixed size (e.g. 80px on profile page, 32px in nav dropdown, 24px in admin user table).
- **Header navbar** — user dropdown in `includes/header.php` shows avatar (or initials) + username instead of just username icon.
- **Admin user management `pages/admin/users.php`** — add a profile picture column (small avatar thumbnail or initials) to the users table so admins can visually identify accounts.

## Acceptance criteria

- [ ] Users can upload JPG/PNG/WebP profile images up to 2MB
- [ ] Uploaded image saves to `uploads/profiles/user_{id}_{timestamp}.{ext}`
- [ ] Profile page shows uploaded image or initials-based avatar as fallback
- [ ] Initials avatar uses purple `#533afd` background with white text
- [ ] Header dropdown shows avatar + username for all logged-in roles
- [ ] Admin users table shows profile picture or initials avatar for each user
- [ ] Reject invalid file types and oversized uploads with error message

## Blocked by

- 018 — Enhancement: Profile Management (All Roles)