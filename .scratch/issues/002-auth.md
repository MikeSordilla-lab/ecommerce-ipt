# 002 — Auth: Login + Registration

## What to build

Implement user authentication pages with role-based redirect and seller approval flow.

**End-to-end behavior:**
- **Login page** (`pages/auth/login.php`): username + password form, POST to itself. On success: regenerate session ID, set `$_SESSION['user_id']`, `$_SESSION['role']`, `$_SESSION['username']`, redirect based on role (admin→admin/dashboard, seller→seller/dashboard, customer→customer/shop). On failure: set flash error and redirect back. Sellers with `is_approved=0` see "Your account is pending admin approval." message.
- **Register page** (`pages/auth/register.php`): username, email, password, confirm_password fields. Role defaults to customer (hidden field). On success: insert user, set flash success, redirect to login. On failure: show validation errors via SweetAlert2. If role=seller is submitted (shouldn't be possible via UI), insert with `is_approved=0`.
- **Landing page** (root `index.php`): if not logged in, show welcome page with Login + Register CTAs; if logged in, redirect to role-appropriate page.
- CSRF token on both forms.

## Acceptance criteria

- [ ] Login with correct credentials → role-based redirect; login with wrong password → error flash
- [ ] Login blocked for sellers with is_approved=0 with message "Your account is pending admin approval."
- [ ] Register with valid data → insert user, redirect to login with success flash
- [ ] Register with duplicate username/email → validation error shown via SweetAlert2
- [ ] CSRF token validated on both forms; invalid/missing token → error flash
- [ ] Session regenerated on successful login
- [ ] Landing page redirects authenticated users to their dashboard

## Blocked by

- 001 — Foundation: DB Schema + Shared Infrastructure