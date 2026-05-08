# 016 — Enhancement: Price Range Filter on Shop Page

## Parent

PRD: E-commerce Platform Fixes & Enhancements (`PRD.md` at repo root)

## What to build

Add a price range filter to the customer shop page with four preset buttons.

**End-to-end behavior:**
- `pages/customer/shop.php` — alongside the existing category dropdown and search form, render four preset filter buttons as a Bootstrap button group:
  - "Under $25" → `price_range=under25`
  - "$25–50" → `price_range=25to50`
  - "$50–100" → `price_range=50to100`
  - "Over $100" → `price_range=over100`
  - Active filter button shows `active` Bootstrap class (or custom selected state styled per DESIGN.md).
- `ProductBrowsingModule::getProducts()` — process `price_range` GET param from `$filters`:
  - `under25`: `p.price < 25`
  - `25to50`: `p.price BETWEEN 25 AND 50`
  - `50to100`: `p.price BETWEEN 50 AND 100`
  - `over100`: `p.price > 100`
  - Add as a WHERE condition alongside existing `category_id` and `search` filters.
- Pagination URLs must include the `price_range` param so the filter persists across pages (e.g., `shop.php?page=2&price_range=under25`).
- Empty/no price range means no price filter is applied (show all).

## Acceptance criteria

- [ ] Four price filter buttons render alongside category/search controls
- [ ] Clicking a filter shows only products in that price range
- [ ] Active filter button shows selected visual state
- [ ] Clicking the same filter again deactivates it (shows all products)
- [ ] Price filter persists across pagination pages
- [ ] Price filter combines correctly with category and search filters

## Blocked by

None - can start immediately