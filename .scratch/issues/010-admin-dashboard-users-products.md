# 010 — Admin: Dashboard + User + Product Management

## What to build

Admin dashboard with stats and full user + product management.

**End-to-end behavior:**
- **Admin dashboard** (`pages/admin/dashboard.php`): Admin only. Stats cards: total users (admins/sellers/customers breakdown), pending seller approvals count, total products, total orders. Recent orders table (last 10): Order ID, Customer, Total, Status, Date.
- **User management** (`pages/admin/users.php`): Admin only. Table: Username, Email, Role badge, Status (Approved/Pending), Registered date, Actions. Actions: Approve button (sets is_approved=1, visible for sellers with is_approved=0), Delete button (confirm, cannot delete users with orders), Role change dropdown (admin/seller/customer — changing to seller resets is_approved to 0).
- **All products** (`pages/admin/products.php`): Admin only. Table: Image, Name, Category, Seller, Price, Stock, Status, Actions. Actions: Edit any product, Delete any product, Activate/Deactivate (toggle is_active). Seller column shows username.

## Acceptance criteria

- [ ] Dashboard stats cards show correct live counts
- [ ] Pending approvals count accurate (sellers with is_approved=0)
- [ ] Admin can approve a seller → is_approved set to 1; seller can then log in
- [ ] Admin can change any user's role; changing to seller resets is_approved to 0
- [ ] Admin cannot delete a user who has placed orders (delete button hidden or error shown)
- [ ] Admin product list shows ALL products from ALL sellers with seller username
- [ ] Admin can edit/delete/activate/deactivate any product
- [ ] Non-admin users receive 403 when accessing any admin page

## Blocked by

- 003 — Customer: Product Browsing + Search + Product Detail + Add to Cart