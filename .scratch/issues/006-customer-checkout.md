# 006 — Customer: Checkout + Order Placement

## What to build

COD checkout with address selection/entry, atomic order creation, and stock deduction.

**End-to-end behavior:**
- **Checkout page** (`pages/customer/checkout.php`): Auth required. Step 1: read-only cart review (items, qty, prices). Step 2: shipping address — select existing saved address (radio list) OR enter new address (full_name, phone, address, "Save this address" checkbox). Step 3: optional order notes (textarea). Step 4: order summary + "Place Order" button.
- **Order placement logic** (server-side in `checkout.php` POST handler): Begin transaction. (a) Insert into `orders` with status=pending, payment_method=COD, shipping_address=JSON of selected/entered address. (b) For each cart_item: insert into `order_items` with price_at_purchase frozen from products table. (c) Deduct stock: `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?` — if any row affected = 0, rollback. (d) Clear cart: `DELETE FROM cart_items WHERE user_id = ?`. Commit. On success: set flash success with order ID, redirect to order confirmation. On failure: rollback, show error.
- Validation: full_name 2-100 chars, phone 5-20 chars (digits/+/ /-), address 10-500 chars, cart not empty, all items in stock.

## Acceptance criteria

- [ ] Checkout step 1 displays read-only cart review with correct totals
- [ ] Existing address selection shows all saved addresses with default pre-selected
- [ ] New address form validates and allows saving
- [ ] Order placed → cart cleared, order + order_items created, stock deducted atomically
- [ ] Stock deduction fails gracefully with rollback and user error if insufficient stock detected at checkout time
- [ ] Order success flash shown with order ID after placement
- [ ] Unauthenticated or empty-cart access to checkout redirects appropriately

## Blocked by

- 004 — Customer: Cart Management
- 005 — Customer: Delivery Address Management