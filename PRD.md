# Product Requirements Document (PRD)
# E-Commerce Platform — Vanilla PHP + MySQL

**Version:** 1.0
**Last Updated:** 2026-05-08
**Status:** Final

---

## 1. Overview

### 1.1 Project Name
Shop — A Vanilla PHP E-Commerce Platform

### 1.2 Project Type
Flat-file e-commerce web application deployed on XAMPP.

### 1.3 Core Functionality Summary
A multi-role e-commerce platform supporting three user roles (admin, seller, customer). Customers browse products, manage a persistent cart, and place COD orders. Sellers manage their own product catalog and view orders for their products. Admins oversee all users, products, and orders, approving seller registrations and controlling order fulfillment status.

### 1.4 Target Users
- **Customers** — Shop and purchase products
- **Sellers** — List and manage products for sale
- **Administrators** — Platform oversight, approval, and configuration

### 1.5 Target Environment
XAMPP (Apache + MySQL + PHP) on Windows. Flat file structure, no framework, no Composer.

---

## 2. Technology Stack

### 2.1 Backend
- **Language:** PHP 8.x (Vanilla, no framework)
- **Database:** MySQL 8.x via PDO
- **Session Management:** PHP native sessions (`session_start()`, `$_SESSION`)
- **Authentication:** Password hashing with `password_hash()` / `password_verify()`

### 2.2 Frontend
- **Framework:** Bootstrap 5 (CDN: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/`)
- **Icons:** Bootstrap Icons (CDN: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/`)
- **Notifications:** SweetAlert2 (CDN: `https://cdn.jsdelivr.net/npm/sweetalert2@11.14.0/`)
- **Design System:** Custom Stripe-inspired CSS (see Section 4 / DESIGN.md)
- **JavaScript:** Vanilla JS with Bootstrap 5 JS bundle

### 2.3 File Structure
```
/ecommerce-ipt/
├── /css/
│   └── styles.css              # Custom Stripe-inspired styles
├── /js/
│   └── app.js                  # Custom JavaScript (SweetAlert2 triggers, AJAX helpers)
├── /includes/
│   ├── config.php              # DB connection, app constants
│   ├── functions.php           # Shared helper functions
│   ├── header.php               # Shared nav header
│   ├── footer.php               # Shared footer
│   └── auth.php                 # Auth middleware (session check, role guard)
├── /pages/
│   ├── /auth/
│   │   ├── login.php
│   │   └── register.php
│   ├── /customer/
│   │   ├── shop.php             # Browse products with category filter + search
│   │   ├── product_detail.php   # Single product view
│   │   ├── cart.php             # Cart management
│   │   ├── checkout.php         # COD checkout + address selection/entry
│   │   ├── orders.php           # Order history list
│   │   ├── order_detail.php     # Single order + tracking
│   │   └── addresses.php        # Manage delivery addresses
│   ├── /seller/
│   │   ├── dashboard.php        # Seller overview + recent orders
│   │   ├── products.php         # Product list (seller's own)
│   │   ├── product_form.php     # Add/Edit product
│   │   └── orders.php           # Seller's orders (products they sold)
│   ├── /admin/
│   │   ├── dashboard.php        # Admin overview stats
│   │   ├── users.php            # User management (approve sellers)
│   │   ├── products.php         # All products
│   │   └── orders.php           # All orders + status updates
│   ├── index.php                # Landing / redirect based on role
│   └── 404.php                  # Not found page
├── /uploads/
│   └── /products/               # Product image uploads
├── /assets/
│   └── /db/
│       └── schema.sql           # Full DB schema + seed data
├── index.php                    # Entry point (redirects to /pages/index.php)
├── DESIGN.md                    # Design system reference
└── PRD.md                       # This document
```

### 2.4 URL Routing
- No URL rewriting. All pages accessed via direct `.php` file paths.
- Entry point: `index.php` in root redirects to appropriate dashboard based on role.
- Role-based redirects after login: admin→`/pages/admin/dashboard.php`, seller→`/pages/seller/dashboard.php`, customer→`/pages/customer/shop.php`.

---

## 3. Database Schema

### 3.1 ER Summary
- `users` — single table for all roles (role ENUM: admin/seller/customer)
- `categories` — product categories
- `products` — products belong to a category, listed by a seller
- `addresses` — delivery addresses per user
- `cart_items` — persistent cart per user
- `orders` — orders with JSON shipping address and COD payment
- `order_items` — snapshot of product at purchase time

### 3.2 Table Definitions

```sql
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role        ENUM('admin','seller','customer') NOT NULL DEFAULT 'customer',
    is_approved TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Admin and customers are auto-approved (is_approved=1). Sellers require admin approval (is_approved=0).

CREATE TABLE categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    category_id  INT NOT NULL,
    seller_id    INT NOT NULL,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    price        DECIMAL(10,2) NOT NULL,
    stock        INT NOT NULL DEFAULT 0,
    image_path   VARCHAR(255) DEFAULT NULL,
    is_active    TINYINT(1) NOT NULL DEFAULT 1,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE addresses (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    full_name  VARCHAR(100) NOT NULL,
    phone      VARCHAR(20) NOT NULL,
    address    TEXT NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

CREATE TABLE orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    total           DECIMAL(10,2) NOT NULL,
    status          ENUM('pending','shipped','delivered') NOT NULL DEFAULT 'pending',
    payment_method  ENUM('COD') NOT NULL DEFAULT 'COD',
    shipping_address JSON NOT NULL,
    notes           TEXT DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    order_id           INT NOT NULL,
    product_id         INT NOT NULL,
    product_name       VARCHAR(200) NOT NULL,
    quantity           INT NOT NULL,
    price_at_purchase  DECIMAL(10,2) NOT NULL,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 3.3 Seed Data

**Admin Account:**
| Field    | Value           |
|----------|-----------------|
| username | admin           |
| email    | admin@shop.com  |
| password | admin123        |
| role     | admin           |
| is_approved | 1            |

**Categories:**
| Name             |
|------------------|
| Electronics      |
| Clothing         |
| Home & Garden    |
| Books            |
| Sports           |

**Sample Products (one per category):**
| Category        | Name              | Price    | Stock | Seller |
|-----------------|-------------------|----------|-------|--------|
| Electronics     | Wireless Headphones | 79.99 | 50    | admin  |
| Clothing        | Cotton T-Shirt    | 24.99    | 100   | admin  |
| Home & Garden   | Plant Pot Set     | 34.99    | 30    | admin  |
| Books           | JavaScript Book   | 49.99    | 25    | admin  |
| Sports          | Dumbbell Set      | 89.99    | 20    | admin  |

---

## 4. Design System

### 4.1 Reference
Full design system is defined in `DESIGN.md`. Implementation MUST follow it exactly.

### 4.2 Key Design Tokens

| Token             | Value                | Usage                          |
|-------------------|----------------------|--------------------------------|
| Primary           | `#533afd`            | CTAs, links, accents           |
| Primary Hover     | `#4434d4`            | Hover on primary elements      |
| Heading           | `#061b31`            | Headings, nav text             |
| Body              | `#64748d`            | Secondary text, descriptions   |
| Background        | `#ffffff`            | Page/card backgrounds           |
| Border Default    | `#e5edf5`            | Card borders, dividers          |
| Success           | `#15be53`            | Success states, in-stock badge  |
| Shadow Primary    | `rgba(50,50,93,0.25)`| Card shadows                   |
| Border Radius     | 4px–8px              | Conservative rounding           |

### 4.3 Typography
- Font: System font stack fallback (Inter-like sans-serif) rendered via Bootstrap 5 base
- Headings: `#061b31`, font-weight 300-400
- Body: `#64748d`
- Buttons: Primary purple background `#533afd`, white text, 4px radius
- Shadows: Multi-layer blue-tinted per DESIGN.md

### 4.4 SweetAlert2 Integration
All flash messages (success, error, warning) are displayed via SweetAlert2 popups triggered by inline JavaScript on page load. No page reloads for notifications.

```html
<!-- In every page that needs a notification -->
<?php if (isset($_SESSION['flash'])): ?>
<script>
Swal.fire({
    icon: '<?= $_SESSION['flash']['type'] ?>',
    title: '<?= addslashes($_SESSION['flash']['title']) ?>',
    text: '<?= addslashes($_SESSION['flash']['message']) ?>',
    confirmButtonColor: '#533afd'
});
</script>
<?php unset($_SESSION['flash']); endif; ?>
```

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow
1. User submits login form (username + password) → POST to `pages/auth/login.php`
2. Server queries `users` table by username
3. `password_verify()` checks password against `password_hash`
4. On success: set `$_SESSION['user_id']`, `$_SESSION['role']`, `$_SESSION['username']`
5. Redirect based on role: admin→`/pages/admin/dashboard.php`, seller→`/pages/seller/dashboard.php`, customer→`/pages/customer/shop.php`
6. On failure: set `$_SESSION['flash']` with error, redirect back to login

### 5.2 Session Structure
```php
$_SESSION['user_id']  // int: logged-in user's ID
$_SESSION['role']    // string: 'admin' | 'seller' | 'customer'
$_SESSION['username'] // string: username
```

### 5.3 Auth Middleware (`includes/auth.php`)
Every protected page includes `includes/auth.php` at the top. It:
1. Checks `$_SESSION['user_id']` is set → if not, redirect to login
2. Optionally checks role: `require_role('admin')` halts with 403 if role doesn't match

### 5.4 Role-Based Access Control (RBAC)

| Page                  | Allowed Roles         |
|-----------------------|-----------------------|
| /pages/auth/*         | Public (guest only)   |
| /pages/customer/*     | customer              |
| /pages/seller/*       | seller (if is_approved)|
| /pages/admin/*        | admin                 |

### 5.5 Password Requirements
- Minimum 6 characters
- Stored as `password_hash()` with default BCRYPT algorithm
- Plain-text passwords never stored or logged

---

## 6. Customer Features

### 6.1 Product Browsing (shop.php)
**Access:** Authenticated customers only.

**Layout:** Grid of product cards (3 columns desktop, 2 tablet, 1 mobile). Sidebar/top bar with category filter dropdown and search input.

**Features:**
- **Category Filter:** Dropdown listing all categories. Selecting a category filters products. "All Categories" option resets filter.
- **Search:** Text input with submit button. Searches product `name` and `description` (case-insensitive LIKE match). Results shown immediately on same page.
- **Product Cards:** Display product image, name, price, stock badge ("In Stock" / "Out of Stock"), "Add to Cart" button.
- **Pagination:** 12 products per page. Page numbers shown at bottom.
- **Empty State:** If no products match, show "No products found" message with suggestion to clear filters.

### 6.2 Product Detail (product_detail.php)
**Access:** Authenticated customers only.

**Display:**
- Large product image (or placeholder if none)
- Product name, category name, seller username
- Price (large, prominent)
- Description
- Stock status with quantity ("23 in stock" or "Out of Stock")
- Quantity input (number, min=1, max=available stock, default=1)
- "Add to Cart" button (disabled if out of stock)
- "Back to Shop" link

**Behavior:**
- Add to Cart → insert/replace row in `cart_items` (upsert with `ON DUPLICATE KEY UPDATE quantity`), set flash success, redirect to cart or stay on page with toast.
- If stock is 0, "Add to Cart" button is disabled.

### 6.3 Cart Management (cart.php)
**Access:** Authenticated customers only.

**Layout:** Table of cart items with image thumbnail, name, unit price, quantity selector, subtotal, remove button. Order summary sidebar on right.

**Features:**
- **Quantity Update:** Number input per item. On change, AJAX POST to `api/cart_update.php` or form submit. Minimum 1, maximum = product stock.
- **Remove Item:** "Remove" button per row → confirm dialog → delete from `cart_items`.
- **Empty Cart:** If no items, show "Your cart is empty" with link to shop.
- **Stock Validation:** Before checkout, verify each cart item quantity ≤ product.stock. If stock changed (decreased elsewhere), show warning and block checkout for that item.
- **Order Summary:** Shows subtotal, estimated total (subtotal, no shipping charge for COD), item count.

### 6.4 Checkout (checkout.php)
**Access:** Authenticated customers only. Must have items in cart.

**Step 1: Review Cart** — Display cart items, quantities, prices, totals (read-only).

**Step 2: Shipping Address** — Either:
- Select an existing saved address from `addresses` table (radio buttons)
- Or enter a new address: full_name, phone, address (textarea), "Save this address" checkbox

**Step 3: Order Notes** — Optional textarea for delivery instructions.

**Step 4: Confirm Order** — Review full order summary. "Place Order" button.

**On Order Placement:**
1. Validate all inputs (address fields required, cart not empty, stock available)
2. Begin transaction:
   a. Insert into `orders` with status='pending', payment_method='COD', shipping_address=JSON of selected address
   b. For each cart_item: insert into `order_items` with frozen price (from products table at this moment)
   c. Deduct stock: `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`
   d. Clear cart: `DELETE FROM cart_items WHERE user_id = ?`
3. Commit transaction. If any step fails, rollback.
4. Set `$_SESSION['flash']` with success message containing order ID.
5. Redirect to order confirmation page.

**Validation Rules:**
- Full name: required, 2-100 chars
- Phone: required, 5-20 chars, digits and + only
- Address: required, 10-500 chars
- Cart must not be empty
- All items must have stock ≥ requested quantity

### 6.5 Order History (orders.php)
**Access:** Authenticated customers only.

**Layout:** Table/list of customer's orders sorted by newest first.

**Columns:** Order ID, Date, Total Amount, Status badge, "View Details" link.

**Status Badges:**
- `pending` → yellow/warning badge
- `shipped` → blue/info badge
- `delivered` → green/success badge

**Empty State:** "You haven't placed any orders yet." with link to shop.

### 6.6 Order Detail (order_detail.php)
**Access:** Authenticated customers only. Must own the order.

**Display:**
- Order ID, order date, status
- Shipping address (parsed from JSON)
- Order items table: product name (snapshot), quantity, price at purchase
- Order total
- Status timeline: pending → shipped → delivered (visual indicator)
- Notes field

### 6.7 Delivery Address Management (addresses.php)
**Access:** Authenticated customers only.

**Features:**
- List all saved addresses with default indicator
- "Add New Address" form: full_name, phone, address (textarea)
- Set default address (only one default at a time — unsetting previous default)
- Edit address
- Delete address (confirm dialog; cannot delete if used in pending orders)
- At checkout, default address is pre-selected

---

## 7. Seller Features

### 7.1 Seller Registration & Approval
**Access:** Public.

**Registration (`pages/auth/register.php`):**
- Fields: username, email, password, confirm_password, role (=seller forced)
- Server validation: all fields required, email format, username unique, password ≥6 chars
- On success: insert user with role='seller', is_approved=0 → show "Your account is pending approval" message
- On failure: show validation errors via SweetAlert2

**Approval:** Admin approves via `/pages/admin/users.php`.

**Login Restriction:** Sellers with `is_approved=0` cannot log in. Login page shows "Your account is pending admin approval."

### 7.2 Seller Dashboard (dashboard.php)
**Access:** Authenticated, approved sellers only.

**Stats Cards:**
- Total products listed
- Total orders containing seller's products
- Pending orders count

**Recent Orders:** Table of last 10 orders containing seller's products (product linked to seller).

### 7.3 Product Management (products.php, product_form.php)
**Access:** Authenticated, approved sellers only.

**Product List (`products.php`):**
- Table: Image thumbnail, Name, Category, Price, Stock, Status (active/inactive), Actions (Edit, Delete)
- "Add New Product" button → `product_form.php?action=add`
- Filter by category, search by name
- Only shows seller's own products

**Add/Edit Product (`product_form.php`):**
- Fields: Category (dropdown from categories table), Name (text, max 200), Description (textarea), Price (decimal, min 0.01), Stock (integer, min 0), Image upload (file input, accepts jpg/png/webp, max 2MB, stored in `/uploads/products/`), is_active (checkbox, default checked)
- On add: INSERT into products with seller_id = current user
- On edit: UPDATE products, validate ownership (seller can only edit own products)
- On delete: Confirm dialog → soft-delete by setting is_active=0 OR hard-delete (if no orders reference it)
- Validation: All required fields validated server-side. Price must be > 0. Stock must be ≥ 0.

### 7.4 Seller Orders (orders.php)
**Access:** Authenticated, approved sellers only.

**Display:** Orders containing the seller's products. Grouped by order_id.

**Columns:** Order ID, Customer username, Item details, Total, Status, Updated date.

**Restriction:** Sellers can view orders but cannot change status. Only admins can update order status.

---

## 8. Admin Features

### 8.1 Admin Dashboard (dashboard.php)
**Access:** Admin only.

**Stats:**
- Total users (with breakdown: admins, sellers, customers)
- Pending seller approvals (count of sellers with is_approved=0)
- Total products
- Total orders
- Recent orders (last 10)

### 8.2 User Management (users.php)
**Access:** Admin only.

**Table:** Username, Email, Role badge, Status (Approved/Pending), Registered date, Actions.

**Actions:**
- **Approve Seller:** Button to set `is_approved=1`. Only visible for `is_approved=0` rows.
- **Delete User:** Confirm dialog. Cannot delete if user has orders.
- **Change Role:** Dropdown to change role (admin, seller, customer). Changing to seller resets is_approved to 0.

### 8.3 All Products (products.php)
**Access:** Admin only.

**Table:** Image, Name, Category, Seller, Price, Stock, Status, Actions.

**Actions:** Edit any product, Delete any product, Activate/Deactivate.

### 8.4 All Orders (orders.php)
**Access:** Admin only.

**Table:** Order ID, Customer, Total, Status, Date, Actions.

**Status Update:**
- Admin can change status: pending → shipped → delivered
- Each status change logs a timestamp (updated_at auto-update)
- Visual status timeline shown on order detail

---

## 9. Public Pages

### 9.1 Landing Page (index.php in root)
- If not logged in: show welcome landing page with "Login" and "Register" CTAs
- If logged in: redirect to role-appropriate dashboard

### 9.2 Login (pages/auth/login.php)
- Fields: username, password
- "Remember me" checkbox (optional, extends session)
- Link to register

### 9.3 Register (pages/auth/register.php)
- Fields: username, email, password, confirm_password
- Role selector hidden (default to customer). Seller registration forces role=seller.
- Terms acceptance checkbox
- Link to login

### 9.4 404 Page (pages/404.php)
- Friendly "Page Not Found" message
- Link back to shop (if customer) or dashboard (if logged in)

---

## 10. API / Server-Side Endpoints (AJAX Handlers)

All endpoints return JSON. Authentication check on all.

| Endpoint                      | Method | Params                          | Response                        |
|-------------------------------|--------|----------------------------------|---------------------------------|
| `/api/cart_add.php`           | POST   | product_id, quantity             | {success, cart_count, message} |
| `/api/cart_update.php`        | POST   | cart_item_id, quantity          | {success, new_subtotal, message}|
| `/api/cart_remove.php`        | POST   | cart_item_id                    | {success, message}              |
| `/api/cart_count.php`         | GET    | —                               | {count}                         |
| `/api/address_add.php`        | POST   | full_name, phone, address       | {success, address_id, message}  |
| `/api/address_set_default.php` | POST   | address_id                      | {success, message}              |
| `/api/address_delete.php`      | POST   | address_id                      | {success, message}              |
| `/api/order_status.php`       | POST   | order_id, status (admin only)   | {success, message}             |

All API responses include `Content-Type: application/json`. On auth failure, return HTTP 401 with `{"error": "Unauthorized"}`.

---

## 11. Validation Rules Summary

### 11.1 Registration
| Field          | Rule                                          |
|----------------|-----------------------------------------------|
| username       | required, 3-50 chars, alphanumeric + underscore, unique |
| email          | required, valid email format, unique          |
| password       | required, min 6 chars                         |
| confirm_password | must match password                        |

### 11.2 Login
| Field          | Rule                                          |
|----------------|-----------------------------------------------|
| username       | required                                      |
| password       | required                                      |

### 11.3 Checkout
| Field          | Rule                                          |
|----------------|-----------------------------------------------|
| full_name      | required, 2-100 chars                         |
| phone          | required, 5-20 chars, digits/+/-/space        |
| address        | required, 10-500 chars                        |
| cart           | must have ≥1 item, all items in stock         |

### 11.4 Product Form (Add/Edit)
| Field          | Rule                                          |
|----------------|-----------------------------------------------|
| category_id    | required, must exist in categories table      |
| name           | required, max 200 chars                       |
| description    | optional, max 5000 chars                      |
| price          | required, decimal, > 0, max 999999.99          |
| stock          | required, integer, ≥ 0                       |
| image          | optional, jpg/png/webp, max 2MB               |
| is_active      | boolean                                       |

### 11.5 Address Form
| Field          | Rule                                          |
|----------------|-----------------------------------------------|
| full_name      | required, 2-100 chars                         |
| phone          | required, 5-20 chars                          |
| address        | required, 10-500 chars                        |

---

## 12. Error Handling

### 12.1 Server-Side Errors
- All PDO queries wrapped in try/catch
- Database errors: log to PHP error log, show generic "Something went wrong" message to user
- Never expose SQL errors or stack traces

### 12.2 Client-Side
- Form validation using HTML5 attributes + server-side validation on submit
- AJAX errors: show SweetAlert2 error message
- Empty states: friendly messages with actionable links for all list/table pages

### 12.3 Flash Messages
All feedback uses SweetAlert2 via `$_SESSION['flash']`:
```php
$_SESSION['flash'] = [
    'type'    => 'success' | 'error' | 'warning' | 'info',
    'title'   => 'Success',
    'message' => 'Your order has been placed!'
];
```

---

## 13. File Upload Specifications

### 13.1 Product Images
- **Location:** `/uploads/products/`
- **Allowed types:** image/jpeg, image/png, image/webp
- **Max size:** 2MB
- **Naming:** `product_{product_id}_{timestamp}.{ext}` for edited products; `product_new_{timestamp}.{ext}` for new products
- **Fallback:** If no image, display a placeholder via CSS or a default `no-image.png` in `/uploads/products/`

### 13.2 Upload Handling
- All uploads validated server-side (MIME type check, size check)
- Images resized to max 800px width using GD functions (optional but recommended)
- Upload failures do not block form submission — show error and allow retry

---

## 14. Session & Security

### 14.1 Session Configuration
```php
session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true
]);
```

### 14.2 Security Measures
- `password_hash()` / `password_verify()` for all passwords
- All user inputs sanitized with `htmlspecialchars()` before output
- All SQL queries use prepared statements (PDO with named/positional params)
- CSRF tokens on all POST forms (generate `$_SESSION['csrf_token']`, validate on submit)
- No sensitive data in `$_SESSION` (only user_id, role, username)
- Session regeneration on login (`session_regenerate_id(true)`)

---

## 15. Acceptance Criteria by Rubric

### 15.1 Transaction Management (25 pts)
- [ ] Product listing with category filter and search
- [ ] Product detail page with stock display
- [ ] Add to cart (persisted in database)
- [ ] Cart page: update quantity, remove items
- [ ] Cart persistence across page reloads
- [ ] Checkout page with COD selection
- [ ] Delivery address selection (saved) or entry (new)
- [ ] Order placed → cart cleared, order + order_items created
- [ ] Stock deducted at order confirmation
- [ ] Order history displayed with status
- [ ] Order detail with frozen prices
- [ ] Validation prevents checkout with empty/invalid data
- [ ] SweetAlert2 success confirmation after order

### 15.2 Delivery Management (20 pts)
- [ ] Order status: pending → shipped → delivered
- [ ] Admin can update order status
- [ ] Customer can see current status in order detail
- [ ] Shipping address stored and displayed per order
- [ ] Order notes field functional
- [ ] Status badges (color-coded) on order lists

### 15.3 User Roles & Access Control (20 pts)
- [ ] Three roles: admin, seller, customer
- [ ] Login with username/password
- [ ] Role-based redirect after login
- [ ] Session-based auth on all protected pages
- [ ] Sellers require is_approved=1 to login
- [ ] Admin-only pages blocked for non-admins
- [ ] Seller pages blocked for non-sellers
- [ ] Customer pages blocked for non-customers
- [ ] Password hashing (no plain text)
- [ ] CSRF protection on POST forms

### 15.4 Inventory Management (20 pts)
- [ ] Seller can add product with all fields
- [ ] Seller can edit own products
- [ ] Seller can delete/deactivate own products
- [ ] Admin can edit/delete any product
- [ ] Stock displayed on product cards and detail pages
- [ ] Stock deducted on checkout (atomic transaction)
- [ ] Cannot add to cart more than available stock
- [ ] Cannot checkout with item exceeding stock
- [ ] "Out of Stock" badge when stock = 0
- [ ] Product category shown correctly

### 15.5 Deployment & Hosting (10 pts)
- [ ] Runs on XAMPP (flat file, no Docker)
- [ ] MySQL database created via schema.sql
- [ ] Responsive Bootstrap 5 layout
- [ ] Works on mobile browsers (responsive breakpoints)
- [ ] No external dependencies requiring Composer
- [ ] CDN resources load correctly

### 15.6 UI/UX Design & Responsiveness (5 pts)
- [ ] Stripe-inspired design (colors, shadows, typography from DESIGN.md)
- [ ] Consistent navigation across all pages
- [ ] Responsive layout (mobile-friendly)
- [ ] SweetAlert2 for all user feedback
- [ ] Clean, readable forms and tables
- [ ] Loading states on buttons during form submit

### 15.7 Code Quality & Organization (5 pts)
- [ ] Logical file/folder structure
- [ ] Shared includes (header, footer, config, functions, auth)
- [ ] No code duplication (reusable functions)
- [ ] Consistent naming conventions
- [ ] Basic inline comments on complex logic

### 15.8 Error Handling & Validation (5 pts)
- [ ] Server-side validation on all forms
- [ ] Meaningful error messages to user
- [ ] Empty state handling (empty cart, no orders, no products)
- [ ] Graceful handling of DB connection failures
- [ ] No PHP errors/warnings exposed to users

---

## 16. Implementation Order

### Phase 1: Foundation
1. Create `schema.sql` and import into MySQL
2. Create `includes/config.php` — DB connection
3. Create `includes/functions.php` — shared helpers (flash, redirect, sanitize)
4. Create `includes/auth.php` — session check + role guard
5. Create `includes/header.php` and `includes/footer.php`
6. Create `css/styles.css` — design system tokens
7. Create `js/app.js` — shared JS (AJAX helpers, SweetAlert2 triggers)

### Phase 2: Auth
8. Create `pages/auth/login.php` + form handler
9. Create `pages/auth/register.php` + form handler
10. Seed admin user + categories + sample products

### Phase 3: Customer Core
11. Create `pages/customer/shop.php` — product browsing
12. Create `pages/customer/product_detail.php`
13. Create `pages/customer/cart.php` + `api/cart_*` endpoints
14. Create `pages/customer/checkout.php` + order placement logic
15. Create `pages/customer/orders.php` + `pages/customer/order_detail.php`
16. Create `pages/customer/addresses.php` + `api/address_*` endpoints

### Phase 4: Seller
17. Create `pages/seller/dashboard.php`
18. Create `pages/seller/products.php` + `pages/seller/product_form.php`
19. Create `pages/seller/orders.php`

### Phase 5: Admin
20. Create `pages/admin/dashboard.php`
21. Create `pages/admin/users.php` (with approval workflow)
22. Create `pages/admin/products.php`
23. Create `pages/admin/orders.php` (with status update)

### Phase 6: Polish
24. Add all SweetAlert2 flash triggers
25. Add CSRF tokens to all forms
26. Add empty states
27. Add loading states
28. Final responsive testing

---

## 17. Appendix: Default Admin Credentials

| Field    | Value           |
|----------|-----------------|
| Username | admin           |
| Email    | admin@shop.com  |
| Password | admin123        |
| Role     | admin           |
| is_approved | 1            |

**Change these credentials before production deployment.**

---

*End of PRD*