# 007 — Customer: Order History + Order Detail

## What to build

Customer order tracking with status badges, timeline, and frozen-price snapshots.

**End-to-end behavior:**
- **Order history page** (`pages/customer/orders.php`): Auth required (customer). Table sorted newest first: Order ID, Date, Total Amount, Status badge (pending=yellow, shipped=blue, delivered=green), "View Details" link. Empty state: "You haven't placed any orders yet" with link to shop.
- **Order detail page** (`pages/customer/order_detail.php`): Auth required (customer, must own order). Shows Order ID, order date, status badge + visual timeline (pending→shipped→delivered), shipping address (parsed from JSON), order items table (product name snapshot, quantity, price_at_purchase), order total, notes field.

## Acceptance criteria

- [ ] Orders table only shows orders belonging to the logged-in customer
- [ ] Status badges display correct colors for each status
- [ ] Order detail shows frozen product names and prices (not current values)
- [ ] Shipping address parsed and displayed correctly from JSON
- [ ] Status timeline shows all three states with current state highlighted
- [ ] Customer cannot view another customer's order (403 if attempted)
- [ ] Empty state shown when no orders exist

## Blocked by

- 003 — Customer: Product Browsing + Search + Product Detail + Add to Cart