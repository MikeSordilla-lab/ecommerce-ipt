# 005 — Customer: Delivery Address Management

## What to build

CRUD for delivery addresses with default-address logic.

**End-to-end behavior:**
- **Addresses page** (`pages/customer/addresses.php`): Auth required (customer). Lists all saved addresses showing full_name, phone, address, default badge. "Add New Address" form: full_name, phone, address (textarea). "Set as Default" button per address. Edit and Delete actions per address. Delete confirmation dialog. Cannot delete an address used in a pending order (show error flash). Default address pre-selected at checkout.
- **Address add endpoint** (`api/address_add.php`): POST, auth required. Accepts `full_name`, `phone`, `address`, `is_default` (optional). Validates all fields. Inserts into `addresses`. If `is_default=1`, unsets previous default. Returns `{success, address_id, message}`.
- **Set default endpoint** (`api/address_set_default.php`): POST, auth required. Accepts `address_id`. Unsets current default, sets new default. Returns `{success, message}`.
- **Delete endpoint** (`api/address_delete.php`): POST, auth required. Accepts `address_id`. Checks no pending orders use this address. Deletes if safe, returns error if not.

## Acceptance criteria

- [ ] Address list shows all addresses with default clearly marked
- [ ] Add form validates: full_name 2-100 chars, phone 5-20 chars, address 10-500 chars
- [ ] Setting a new default unsets the previous default atomically
- [ ] Delete blocked with error message if address is used in a pending order
- [ ] Address CRUD operations return JSON and show SweetAlert2 feedback without page reload

## Blocked by

- 004 — Customer: Cart Management