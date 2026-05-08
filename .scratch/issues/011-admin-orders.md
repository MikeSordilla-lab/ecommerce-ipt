# 011 — Admin: Order Management

## What to build

Admin order management with status transition control.

**End-to-end behavior:**
- **All orders page** (`pages/admin/orders.php`): Admin only. Table: Order ID, Customer username, Total, Status badge, Date, Actions. Actions: "Update Status" button → opens status change form/modal.
- **Order status endpoint** (`api/order_status.php`): Admin only. POST accepts `order_id` and `status`. Validates transition is valid (pending→shipped→delivered). Updates status. Returns `{success, message}`.
- **Status timeline**: Visual timeline shown on order detail (pending→shipped→delivered) with current state highlighted.

## Acceptance criteria

- [ ] Admin sees all orders from all customers
- [ ] Status badges show correct colors
- [ ] Admin can transition: pending → shipped → delivered (forward only, no skipping)
- [ ] Invalid status transitions rejected server-side with error message
- [ ] Status update reflected immediately (updated_at timestamp auto-updates)
- [ ] Non-admin requests to order_status endpoint return HTTP 401/403

## Blocked by

- 010 — Admin: Dashboard + User + Product Management