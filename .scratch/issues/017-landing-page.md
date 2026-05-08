# 017 — Enhancement: Landing Page (Stripe-Inspired Design)

## Parent

PRD: E-commerce Platform Fixes & Enhancements (`PRD.md` at repo root)

## What to build

Build a professional landing page for unauthenticated visitors following the Stripe design system. Logged-in users are redirected to their role-appropriate dashboard.

**End-to-end behavior:**
- `pages/index.php` — if user is not logged in, render the landing page. If logged in, redirect to `../customer/shop.php` (customer), `../seller/dashboard.php` (seller), or `../admin/dashboard.php` (admin).
- **Hero section**: white background, large headline (weight 300, `#061b31`, letter-spacing per DESIGN.md), subheadline, two CTA buttons: "Login" (primary purple `#533afd`) and "Register" (outline/secondary). Use Stripe-style multi-layer blue-tinted shadows on cards.
- **Feature cards section**: 3-column grid of cards — "Shop", "Track Orders", "Secure Checkout" — with Bootstrap Icons, brief descriptions, and the same Stripe shadow styling.
- **Dark brand section**: background `#1c1e54`, white text, centered brand statement.
- **Footer**: simple footer with copyright.
- No featured products section — products are only visible after login.
- Follow DESIGN.md tokens exactly: primary `#533afd`, heading `#061b31`, body `#64748d`, shadows, border-radius 4–8px.

## Acceptance criteria

- [ ] Unauthenticated user sees landing page at `/pages/index.php`
- [ ] Logged-in customer is redirected to customer/shop.php
- [ ] Logged-in seller is redirected to seller/dashboard.php
- [ ] Logged-in admin is redirected to admin/dashboard.php
- [ ] Hero section has headline, subheadline, and Login + Register CTAs
- [ ] 3 feature cards render with icons and descriptions
- [ ] Dark brand section renders with `#1c1e54` background
- [ ] Design matches DESIGN.md tokens (colors, shadows, typography)

## Blocked by

None - can start immediately