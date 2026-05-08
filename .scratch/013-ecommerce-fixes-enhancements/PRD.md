# PRD: E-commerce Platform Fixes & Enhancements

**Status:** ready-for-agent

---

## Problem Statement

The e-commerce platform has multiple blocking bugs that prevent customers from completing purchases and sellers from managing their orders. Additionally, several UX enhancements are needed to bring the platform to a production-ready state, including image display for products, a price range filter on the shop page, a Stripe-design-compliant landing page, and a profile management section for all user types.

---

## Solution

Fix all blocking bugs in priority order, then implement UX enhancements. All changes follow the existing Stripe-inspired design system (DESIGN.md). The implementation prioritizes server-side solutions over client-side, avoids storing external API data in the database, and maintains backward compatibility with existing uploaded images.

---

## User Stories

### Bug Fixes

1. As a **customer**, I want to see product images on the shop page, so that I can visually identify products before adding them to my cart.
2. As a **customer**, I want to see product images in my cart, so that I can verify the correct items are in my order before checking out.
3. As a **customer**, I want to place an order using a saved address, so that I don't have to retype my address on every order.
4. As a **seller**, I want to update the status of orders containing my products, so that I can mark orders as shipped when fulfilled.

### Feature Enhancements

5. As a **customer**, I want to filter products by price range, so that I can quickly find products within my budget.
6. As a **customer**, I want to see product images from the dummyjson API when no local image has been uploaded, so that the shop page is visually complete for all products.
7. As a **customer**, I want to upload my own product images when listing items for sale, so that my products are visually distinct from the default placeholder images.
8. As an **unauthenticated visitor**, I want to see a professional landing page following the Stripe design system, so that I understand the platform's brand and can sign up or log in.
9. As a **customer**, I want to edit my profile (name, email, password), so that I can keep my account information current.
10. As a **seller**, I want to edit my profile (name, email, password), so that I can keep my business account information current.
11. As an **admin**, I want to edit my profile (name, email, password), so that I can keep my admin account information current.
12. As a **logged-in user**, I want to see my profile information and avatar on my dashboard, so that I can quickly verify which account I'm using.
13. As a **logged-in user**, I want a profile picture, so that my account feels personalized.
14. As a **logged-in user**, I want to change my password by providing my current password, so that my account is protected from unauthorized changes.
15. As a **customer**, I want to upload a profile picture, so that my account feels personalized.
16. As a **seller**, I want to upload a profile picture, so that my seller account feels personalized.
17. As an **admin**, I want to upload a profile picture, so that my admin account feels personalized.
18. As an **admin**, I want to see profile pictures of users in the User Management table, so that I can visually identify accounts.
19. As a **customer**, I want to see an initials-based avatar when I have no profile picture, so that my account has a visual representation without requiring an image upload.
20. As a **seller**, I want to see an initials-based avatar when I have no profile picture, so that my account has a visual representation without requiring an image upload.
21. As an **admin**, I want to see an initials-based avatar when I have no profile picture, so that my account has a visual representation without requiring an image upload.

---

## Implementation Decisions

### 1. Product Image Fallback (Bugs 1, 2, Feature 6)

- **Mechanism:** PHP server-side image resolution at display-time, not stored in database.
- **Matching:** Product name-based search against `https://dummyjson.com/products/search?q={name}`.
- **Priority:** Seller-uploaded local image path (`products.image_path`) takes precedence over dummyjson thumbnail. Only use dummyjson when `image_path` is null/empty.
- **Caching:** No caching — dummyjson URL fetched fresh on every page load. Rationale: `file_get_contents` is simple, images are small, and stale data is avoided.
- **Fallback UI:** When dummyjson also returns no result, show a Bootstrap icon placeholder (`bi-image`) rather than a broken image.
- **Modified modules:** `ProductBrowsingModule::getProducts()` — inject dummyjson thumbnail as `image_path` key when local path is empty. `CartModule::getCart()` — same logic for cart items.

### 2. Checkout Saved Address Bug Fix (Bug 3)

- **Root cause:** When a saved address radio is selected, JavaScript hides `#new_address_fields` via CSS `display: none`, but the form fields (`full_name`, `phone`, `address`) are never disabled or cleared — they submit empty strings, failing server validation.
- **Fix:** When a saved address radio is selected, populate the hidden fields with the address data from the `data-address` JSON attribute. Fields remain in the DOM and submit valid data. The `required` attribute is removed dynamically when using a saved address to prevent HTML5 validation blocking the form.
- **Modified files:** `pages/customer/checkout.php` — enhance the existing radio `change` event handler.

### 3. Seller Order Status Update (Bug 4)

- **Permission fix:** Change `api/order_status.php` line 14 from `$_SESSION['role'] !== 'admin'` to `!in_array($_SESSION['role'], ['admin', 'seller'])`.
- **Ownership check:** Add a SQL query to verify the seller owns at least one product in the order before allowing the status update. Sellers can only update orders that contain their products.
- **Status transitions:** Sellers can transition `pending → shipped`. Only admins can transition `shipped → delivered`.

### 4. Price Range Filter (Feature 5)

- **UI:** Four preset filter buttons rendered as a button group: "Under $25", "$25–50", "$50–100", "Over $100". Active filter shows selected state.
- **Implementation:** Price filter is a GET query param (`price_range=under25`, etc.) processed in `ProductBrowsingModule::getProducts()`. Uses `WHERE p.price BETWEEN ? AND ?` clauses.
- **Persistence:** Filter persists across pagination — the price range param is included in all pagination URLs.
- **Location:** Rendered alongside the existing category dropdown and search form in `pages/customer/shop.php`.

### 5. Landing Page (Feature 8)

- **Access:** Unauthenticated users see the landing page at `/pages/index.php`. Logged-in users (all roles) are redirected to their respective dashboards.
- **Design:** Follows DESIGN.md Stripe aesthetic — white background, deep navy headings, Stripe Purple CTAs, blue-tinted multi-layer shadows, weight 300 headlines.
- **Sections:** (1) Hero with headline + CTA buttons, (2) 3-column feature cards (Shop, Track Orders, Secure Checkout), (3) Dark brand section (`#1c1e54` background), (4) Footer.
- **No featured products section** — keeps scope focused. Products are only visible after login.

### 6. Profile Section (Features 9–12)

- **Single page:** `pages/profile.php` serves all user types. Role-specific content is conditional.
- **Editable fields:** Username (display name), email address, password (change only — no plain-text storage).
- **Password change flow:** Three fields — current password, new password, confirm new password. Current password is required before setting a new one (security). Validation: new password must be at least 8 characters and confirmed exactly.
- **Access:** Link added to the header user dropdown for all logged-in roles. No separate profile page per role.
- **Modified files:** New `pages/profile.php`, new `api/profile_update.php`, updated `includes/header.php` (dropdown link).

### 7. Dashboard Profile Card (Features 12, 14–17)

- **Location:** Rendered at the top of each dashboard page (admin, seller, and the customer shop page acts as the customer dashboard equivalent).
- **Content:** User avatar (with initials fallback), username, email, role badge, "Member since" date.
- **Navbar compact avatar:** The header user dropdown shows the avatar+username instead of just the username icon.

### 8. Profile Image (Features 13, 18–21)

- **Database:** Add `profile_image VARCHAR(255) NULL` column to `users` table.
- **Upload:** File-based upload to `uploads/profiles/` directory, pattern `user_{id}_{timestamp}.{ext}`. Allowed types: JPG, PNG, WebP. Max size: 2MB.
- **Display:** Initials-based circle avatar (e.g., "JD" for John Doe) with a purple (`#533afd`) background when no image is uploaded. Profile image, if present, overrides the initials circle.
- **Admin user management:** The user table in `pages/admin/users.php` gains a profile picture column (small avatar thumbnail). Admin can view but not upload on behalf of users.

### 9. Schema Changes

```
ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL DEFAULT NULL AFTER email;
```

---

## Testing Decisions

- **External behavior only** — tests verify visible outcomes (images render, orders update, form submissions succeed/fail), not internal implementation details.
- **Good test examples in this codebase:** None currently exist. All testing is manual.
- **Modules to test in isolation:**
  - `ProductBrowsingModule::getProducts()` — verify price filter clauses are generated correctly, verify dummyjson fallback does not modify DB.
  - `CartModule::getCart()` — verify image_path is populated from dummyjson when empty.
  - `OrderPlacementModule::placeOrder()` — verify stock is decremented atomically.
  - Checkout form submission with saved address — verify correct address data is submitted.
- **No automated test suite exists** — manual testing plan: (1) Create a product with no image, verify dummyjson thumbnail appears in shop and cart. (2) Add a saved address and complete checkout with it. (3) Login as seller, find an order containing your product, update status to shipped. (4) Apply each price filter and verify correct products appear. (5) Edit profile and verify changes persist. (6) Upload profile picture and verify it appears in dashboard and admin user management.

---

## Out of Scope

- Automated testing framework setup (no PHPUnit or similar currently in project).
- Profile picture cropping or resizing — uploaded image is stored as-is.
- Email notifications for order status changes.
- Product detail page redesign — only shop/cart image display is being fixed.
- Seller-specific dashboard profile card beyond what's described.
- Price filter for admin product management — only customer-facing shop page.
- Changing user role from the profile page — role management stays in admin panel.
- Landing page featured products section.

---

## Further Notes

- dummyjson API rate limits are not a concern for this scale — the product browsing module makes individual search calls per product only when `image_path` is empty, so at most 5 calls per page load in the worst case (seed data).
- The Stripe DESIGN.md `sohne-var` font is not available via Google Fonts — the implementation uses `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto` as a practical fallback. The weight 300, letter-spacing, and color decisions from DESIGN.md are still applied via CSS.
- Session management uses PHP's native session with `cookie_httponly`, `cookie_samesite=Strict`, and `use_strict_mode` — no changes needed for the profile password-change feature.