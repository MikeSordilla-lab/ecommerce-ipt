# 015 — Fix: Seller Order Status Update (pending → shipped)

## Parent

PRD: E-commerce Platform Fixes & Enhancements (`PRD.md` at repo root)

## What to build

Allow sellers to update order status for orders containing their products, limited to the `pending → shipped` transition.

**End-to-end behavior:**
- `api/order_status.php` line 14 — change `$_SESSION['role'] !== 'admin'` to `!in_array($_SESSION['role'], ['admin', 'seller'])` so both admin and approved-seller sessions can pass the auth check.
- Add an ownership check after the order-exists check: query `order_items JOIN products ON order_items.product_id = products.id` to verify the current seller (`$_SESSION['user_id']`) owns at least one product in the order. If not, return HTTP 403 with `{"success": false, "message": "You do not have permission to update this order"}`.
- Sellers can only transition `pending → shipped` (enforced by the existing `transitions` matrix — add `'pending' => ['shipped']` for seller role context). Admin retains full `pending → shipped → delivered`.
- The existing status transition validation (`transitions` matrix) already enforces forward-only transitions; no change needed there beyond the role guard.

## Acceptance criteria

- [ ] Seller with products in an order can update that order's status from `pending` to `shipped`
- [ ] Seller cannot update an order that contains no products they own (HTTP 403)
- [ ] Seller cannot skip to `delivered` (only `pending → shipped` allowed)
- [ ] Admin retains full status transition capabilities
- [ ] Non-seller, non-admin requests return HTTP 401/403 appropriately

## Blocked by

None - can start immediately