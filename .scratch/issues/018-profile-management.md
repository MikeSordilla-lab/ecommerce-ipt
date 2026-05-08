# 018 — Enhancement: Profile Management (All Roles)

## Parent

PRD: E-commerce Platform Fixes & Enhancements (`PRD.md` at repo root)

## What to build

Build a unified profile page serving all user roles, plus a dashboard profile card.

**End-to-end behavior:**
- **New page `pages/profile.php`** — accessible to all logged-in roles (customer, seller, admin). Shows a profile edit form with: username (text input), email (email input), and password change section (current password + new password + confirm new password, all required). Password change requires current password verification; new password must be ≥8 chars and confirmed exactly.
- **New API `api/profile_update.php`** — POST accepts `username`, `email`, and optionally `current_password`, `new_password`, `confirm_password`. Validates current password before allowing password change. Returns JSON `{success, message}`. Updates `users` table. Email and username uniqueness validated (excluding current user).
- **`includes/header.php`** — add "Profile" link to the user dropdown nav for all logged-in roles.
- **Dashboard profile card** — at the top of each dashboard page (admin/dashboard.php, seller/dashboard.php, customer/shop.php or a shared include), render a card showing: avatar (initials-based initially), username, email, role badge, "Member since" date.
- Profile link in header dropdown navigates to `pages/profile.php`.

## Acceptance criteria

- [ ] `/pages/profile.php` accessible and functional for customer, seller, and admin roles
- [ ] Username and email update successfully and persist
- [ ] Password change requires correct current password; new password ≥8 chars and must match confirmation
- [ ] Invalid current password blocks password change with error message
- [ ] Header dropdown shows "Profile" link for all logged-in roles
- [ ] Dashboard profile card shows username, email, role badge, member-since date
- [ ] Role badge renders correctly for admin (purple), seller (blue), customer (green)

## Blocked by

None - can start immediately