# 003 — Customer: Product Browsing + Search + Product Detail + Add to Cart

## What to build

Full product browsing flow from shop to adding an item to cart.

**End-to-end behavior:**
- **Shop page** (`pages/customer/shop.php`): Auth required (customer role). 3-column product grid (responsive: 2 tablet, 1 mobile). Category filter dropdown (all categories + "All Categories" option). Search input (searches name + description, case-insensitive). Pagination at 12 products/page. Each card shows: product image (or placeholder), name, price, stock badge ("In Stock" in green / "Out of Stock" in red), "Add to Cart" button (disabled if out of stock). Empty state if no products match with "Clear filters" link.
- **Product detail page** (`pages/customer/product_detail.php`): Auth required. Shows large image, name, category, seller username, price (large), description, stock status ("X in stock" or "Out of Stock"), quantity input (number, min=1, max=available stock), "Add to Cart" button (disabled if out of stock). "Back to Shop" link.
- **Add to Cart endpoint** (`api/cart_add.php`): POST only, auth required. Accepts `product_id` and `quantity`. Validates stock availability. Upsert into `cart_items` (increase quantity if same product already in cart). Returns JSON `{success, cart_count, message}`. HTTP 401 if not authenticated.
- **Cart count endpoint** (`api/cart_count.php`): GET, auth required. Returns `{count}`.

## Acceptance criteria

- [ ] Shop page renders all active products in grid with correct stock badges
- [ ] Category filter shows only products in selected category; "All Categories" shows all
- [ ] Search filters products by name/description case-insensitively
- [ ] Pagination shows 12 products per page with correct page numbers
- [ ] Product detail page displays all fields; quantity input capped at available stock
- [ ] Add to Cart creates or updates cart_items row; returns updated cart_count
- [ ] Cannot add out-of-stock product to cart (server-side validation)
- [ ] Unauthenticated requests to API endpoints return HTTP 401

## Blocked by

- 001 — Foundation: DB Schema + Shared Infrastructure