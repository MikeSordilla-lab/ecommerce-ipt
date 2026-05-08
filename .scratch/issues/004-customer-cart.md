# 004 — Customer: Cart Management

## What to build

Persistent cart with quantity updates, removal, and stock validation.

**End-to-end behavior:**
- **Cart page** (`pages/customer/cart.php`): Auth required (customer). Table of cart items: product image thumbnail, name, unit price, quantity input (number, min=1, max=product.stock), subtotal (qty × unit price), remove button. Right sidebar shows order summary: subtotal, item count. Empty state: "Your cart is empty" with link to shop. Stock validation: before rendering checkout, verify each item's quantity ≤ product.stock; if any item exceeded, show warning and block checkout for that item.
- **Cart update endpoint** (`api/cart_update.php`): POST, auth required. Accepts `cart_item_id`, `quantity`. Validates stock. Updates quantity. Returns JSON `{success, new_subtotal, message}`.
- **Cart remove endpoint** (`api/cart_remove.php`): POST, auth required. Accepts `cart_item_id`. Deletes from `cart_items`. Returns JSON `{success, message}`.

## Acceptance criteria

- [ ] Cart page shows all items for current user with correct subtotals
- [ ] Quantity input update fires AJAX POST to cart_update endpoint; subtotal updates without page reload
- [ ] Remove button removes item after confirm dialog
- [ ] Stock validation warning shown if any item quantity exceeds available stock
- [ ] Empty cart shows friendly empty state with link to shop
- [ ] Order summary sidebar shows correct subtotal and item count

## Blocked by

- 003 — Customer: Product Browsing + Search + Product Detail + Add to Cart