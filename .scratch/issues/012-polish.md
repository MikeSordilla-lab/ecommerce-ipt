# 012 — Polish: Flash Messages + CSRF + Empty States + Loading States

## What to build

Cross-cutting polish applied across all existing pages.

**End-to-end behavior:**
- **Flash messages**: Every form submission that succeeds or fails shows a SweetAlert2 popup via `$_SESSION['flash']` + inline JS in header.php. All 4 types (success, error, warning, info) styled correctly with primary color (#533afd) on confirm button.
- **CSRF tokens**: Every POST form (login, register, checkout, address forms, product forms) includes a `csrf_token` hidden field. `includes/functions.php` provides `generate_csrf()` and `validate_csrf()`. Invalid/missing CSRF on POST → error flash, no data modified.
- **Empty states**: All list/table pages show a friendly empty state message with an actionable link when no data is present: empty cart, no orders (customer + seller), no products (seller), no addresses, no users (admin).
- **Loading states**: All form submission buttons show a loading state (button text changes to "Loading..." and button is disabled) during form submit to prevent double-submission.

## Acceptance criteria

- [ ] Every successful/failed action shows a SweetAlert2 popup with appropriate icon and color
- [ ] Every POST form is protected by CSRF token; invalid token returns error and does not process data
- [ ] Empty cart page: "Your cart is empty" + link to shop
- [ ] Empty orders page (customer): "You haven't placed any orders yet" + link to shop
- [ ] Empty orders page (seller): "No orders for your products yet"
- [ ] Empty products page (seller): "You haven't listed any products yet" + link to add product
- [ ] Empty users page (admin): "No users found"
- [ ] All submit buttons disable and show "Loading..." text during form submission

## Blocked by

- 011 — Admin: Order Management