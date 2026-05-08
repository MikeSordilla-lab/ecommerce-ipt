# 008 — Seller: Dashboard + Product Management

## What to build

Seller dashboard with stats and full product CRUD with image upload.

**End-to-end behavior:**
- **Seller dashboard** (`pages/seller/dashboard.php`): Auth + approved-seller required. Stats cards: total products listed, total orders containing seller's products, pending orders count. Recent orders table (last 10): Order ID, Customer, Item details, Total, Status, Date. Empty states for no products and no orders.
- **Product list** (`pages/seller/products.php`): Auth + approved-seller required. Table: image thumbnail, Name, Category, Price, Stock, Status (active/inactive badge), Actions (Edit, Delete). "Add New Product" button → product_form.php. Filter by category, search by name. Only shows seller's own products.
- **Product form** (`pages/seller/product_form.php`): Auth + approved-seller required. Fields: Category (dropdown from categories), Name (text, max 200), Description (textarea), Price (decimal, min 0.01), Stock (integer, min 0), Image upload (jpg/png/webp, max 2MB, stored in /uploads/products/), is_active (checkbox). Add mode: INSERT with seller_id=current user. Edit mode: UPDATE with ownership check (404 if not owner). Delete: confirm dialog → soft-delete (is_active=0) or hard-delete if no order_items reference it.
- **File upload**: Validated MIME type server-side, renamed to `product_{id}_{timestamp}.{ext}`, stored in `/uploads/products/`. GD resize to max 800px width. Upload failure shows error but does not block form submission.

## Acceptance criteria

- [ ] Dashboard stats cards show correct counts
- [ ] Recent orders table shows only orders containing seller's products
- [ ] Product list only shows products where seller_id = current user
- [ ] Add product inserts with all fields; image saved to /uploads/products/
- [ ] Edit product only allowed for products owned by current seller (404 otherwise)
- [ ] Stock and price validation enforced (price > 0, stock >= 0)
- [ ] Image upload accepts only jpg/png/webp, rejects larger than 2MB
- [ ] Seller cannot access pages if is_approved=0 (redirect to pending approval message)

## Blocked by

- 001 — Foundation: DB Schema + Shared Infrastructure