# E-Commerce Platform Domain Documentation

## Overview

This document describes the domain model and architecture for the e-commerce platform. The platform supports three user roles: **admin**, **seller**, and **customer**.

---

## Glossary of Terms

### User
Represents a platform user with one of three roles:
- **admin**: Can manage categories, view all orders, manage sellers
- **seller**: Can list products, view their own orders
- **customer**: Can browse products, manage cart, place orders

### Product
An item listed by a seller. Belongs to exactly one **Category**. Tracks:
- Name, description, price, stock quantity
- Active/inactive status
- Seller reference

### Category
Hierarchical grouping of products. Products must belong to a category.

### Cart
Per-customer persistent shopping cart. Contains **CartItems**.

### CartItem
A **Product** plus a quantity, associated with a specific customer.

### Order
A placed order by a customer. Contains **OrderItems**. Transitions through **OrderStatus**.

### OrderItem
Snapshot of a product at purchase time: captures name, price, and quantity at the moment of order.

### Address
Delivery address associated with a customer. Supports multiple addresses; one can be designated as default.

### OrderStatus
State machine: `pending` → `shipped` → `delivered`

---

## Architecture Overview

### Modules (`includes/modules/`)

#### CartModule (class)
Handles all cart operations for the current customer.

**Methods:**
- `addItem(int $productId, int $quantity): bool` — adds or increments a cart item
- `updateItem(int $productId, int $quantity): bool` — updates quantity (sets to 0 to remove)
- `removeItem(int $productId): bool` — removes item from cart
- `getCart(): array` — returns cart with items and product details
- `getCartCount(): int` — total number of items
- `getCartSubtotal(): float` — subtotal before shipping/taxes

#### OrderPlacementModule (class)
Handles the end-to-end order creation transaction.

**Methods:**
- `placeOrder(int $userId, array $cartItems, array $shippingAddress, int $addressId): int|false` — creates order and order items atomically; returns order ID or false
- `validateStockAvailability(array $cartItems): array` — returns items with insufficient stock
- `calculateOrderTotal(array $cartItems): float` — computes total from cart items
- `parseShippingAddress(int $addressId): array|false` — retrieves and validates address for order

#### AddressModule (functions)
Handles address CRUD and validation for a user.

**Functions:**
- `validateAddressInput(array $data): array` — returns ['valid' => bool, 'errors' => array]
- `createAddress(int $userId, array $data): int|false` — creates new address, returns ID
- `setDefaultAddress(int $addressId, int $userId): bool` — sets default address
- `deleteAddress(int $addressId, int $userId): bool`
- `getAddressesByUser(int $userId): array`

#### ProductBrowsingModule (class)
Handles all product query operations.

**Methods:**
- `getProducts(?int $categoryId = null, int $limit = 20, int $offset = 0): array`
- `getProductById(int $id): array|null`
- `getActiveProductsBySeller(int $sellerId): array`
- `getAllProducts(int $limit = 50, int $offset = 0): array`
- `searchProducts(string $query, int $limit = 20): array`

---

### Authentication Middleware (`includes/middleware/auth.php`)

| Function | Use Case | Behavior |
|----------|----------|----------|
| `require_auth()` | Pages | Redirects to login page if not authenticated |
| `check_role(string $role): bool` | API | Returns true/false for role check |
| `require_role(string $role)` | Pages | Redirects with flash message on failure |
| `check_roles(array $roles): bool` | API | Returns true if user has any of the specified roles |
| `check_approved_seller(): bool` | API | Returns true if seller account is approved |