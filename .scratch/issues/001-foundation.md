# 001 — Foundation: DB Schema + Shared Infrastructure

## What to build

Set up the complete project foundation: database schema, shared PHP includes, CSS design system, and JavaScript utilities.

**End-to-end behavior:**
- MySQL database imported from `schema.sql` containing all 7 tables: `users`, `categories`, `products`, `addresses`, `cart_items`, `orders`, `order_items`
- Admin account seeded: `admin` / `admin123@shop.com` / `admin123` (role=admin, is_approved=1)
- 5 categories seeded: Electronics, Clothing, Home & Garden, Books, Sports
- 5 sample products seeded, one per category (seller=admin)
- All PHP pages include `includes/config.php` for DB connection and constants
- `includes/functions.php` provides `set_flash()`, `redirect()`, `sanitize()` helpers
- `includes/auth.php` provides `require_auth()` and `require_role($role)` middleware
- `includes/header.php` renders consistent nav (role-aware links) + SweetAlert2 flash trigger
- `includes/footer.php` renders consistent footer + Bootstrap 5 JS bundle + `app.js`
- `css/styles.css` implements Stripe-inspired design tokens from `DESIGN.md` (primary=#533afd, heading=#061b31, etc.)
- `js/app.js` provides AJAX helper (`fetchPost`), SweetAlert2 flash display, and CSRF token injection

## Acceptance criteria

- [ ] `schema.sql` creates all 7 tables with correct foreign keys and seed data imported successfully
- [ ] `includes/config.php` connects to MySQL via PDO with error handling
- [ ] `includes/functions.php` — `set_flash($type, $title, $message)`, `redirect($url)`, `sanitize($input)` work correctly
- [ ] `includes/auth.php` — `require_auth()` redirects unauthenticated users to login; `require_role($role)` returns 403 for wrong role
- [ ] `includes/header.php` renders correct nav items per role (customer: shop/cart/orders/addresses/logout, seller: dashboard/products/orders/logout, admin: dashboard/users/products/orders/logout)
- [ ] `css/styles.css` applies correct color tokens, shadows, and typography from DESIGN.md
- [ ] `js/app.js` — `fetchPost(url, data)` sends POST with CSRF token; SweetAlert2 flash renders on page load
- [ ] No PHP errors or warnings on any shared include

## Blocked by

None — can start immediately