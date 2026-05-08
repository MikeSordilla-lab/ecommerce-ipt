# 009 — Seller: Orders View

## What to build

Seller view of orders containing their products (read-only, no status changes).

**End-to-end behavior:**
- **Seller orders page** (`pages/seller/orders.php`): Auth + approved-seller required. Displays orders containing the seller's products, grouped by order_id. Columns: Order ID, Customer username, Item details (product names + quantities from order_items), Total, Status badge, Updated date. Sellers can view but cannot change order status.
- Unapproved sellers (is_approved=0) are blocked from accessing this page.

## Acceptance criteria

- [ ] Only orders containing at least one product listed by the current seller are shown
- [ ] Each seller's products are visible in the order but other sellers' products in the same order are not shown
- [ ] Status badges display correctly for pending/shipped/delivered
- [ ] Sellers cannot modify order status (no action buttons)
- [ ] Empty state shown if no orders contain seller's products
- [ ] Access blocked for unapproved sellers with appropriate message

## Blocked by

- 008 — Seller: Dashboard + Product Management