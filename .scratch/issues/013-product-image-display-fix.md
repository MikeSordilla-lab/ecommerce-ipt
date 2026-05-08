# 013 — Fix: Product Image Display (Shop + Cart) + dummyjson Fallback

## Parent

PRD: E-commerce Platform Fixes & Enhancements (`PRD.md` at repo root)

## What to build

Fix product images so they render in the shop and cart for all products — including those with no locally-uploaded image — using a live dummyjson API fallback.

**End-to-end behavior:**
- `ProductBrowsingModule::getProducts()` — after fetching products, iterate results; for each product where `image_path` is null/empty, call `file_get_contents('https://dummyjson.com/products/search?q=' . urlencode($productName))`, decode JSON, take the first result's `thumbnail` URL, and inject it as `image_path` in the returned array. Do NOT modify the database.
- `CartModule::getCart()` — same logic: when `image_path` is null/empty, resolve dummyjson thumbnail and inject into returned item array.
- `pages/customer/shop.php` — render `<img src="<?= $product['image_path'] ?>"` on each product card. If `image_path` is still empty after module resolution (dummyjson returned no match), show Bootstrap icon placeholder `<i class="bi bi-image"></i>` instead of a broken `<img>`.
- `pages/customer/cart.php` — render product image thumbnail per cart item with same placeholder fallback.

**Mechanism:** PHP server-side resolution at display-time. dummyjson URL fetched fresh on every page load (no caching). Local `products.image_path` always takes precedence over dummyjson.

## Acceptance criteria

- [ ] Product card in shop renders an image for products with no local `image_path` (fetched from dummyjson)
- [ ] Cart item shows product image thumbnail; fallback icon shown when no image available
- [ ] Local uploaded images always take precedence over dummyjson thumbnails
- [ ] No database writes — dummyjson resolution is display-only
- [ ] Placeholder `bi-image` icon shows when dummyjson also has no match

## Blocked by

None - can start immediately