# 014 — Fix: Checkout Saved Address Form Submission Bug

## Parent

PRD: E-commerce Platform Fixes & Enhancements (`PRD.md` at repo root)

## What to build

Fix checkout so that selecting a saved address actually submits the correct address data instead of empty strings.

**End-to-end behavior:**
- `pages/customer/checkout.php` — in the existing radio `change` event listener:
  - When a saved address radio (not "new") is selected: read the `data-address` JSON attribute, parse it, and populate the hidden `#new_address_fields` input values (`full_name`, `phone`, `address`) with that data.
  - Remove the `required` attribute from those three fields when a saved address is active.
  - When "Use a new address" radio is reselected: clear the field values and restore `required` attributes.
- The form submits normally with the populated fields. Server-side validation receives non-empty address data.

**Root cause:** Previously, selecting a saved address only hid the new-address fields via CSS `display: none` but the fields retained empty values, causing server validation to fail on submit.

## Acceptance criteria

- [ ] Selecting a saved address and placing order submits the correct full_name, phone, and address from that saved address
- [ ] Server receives non-empty values for all three address fields when saved address is used
- [ ] HTML5 `required` attribute is removed dynamically when saved address selected (prevents browser-native validation blocking submit)
- [ ] Reselecting "new address" restores empty fields and `required` attributes
- [ ] New address entry still works normally when "Use a new address" is selected

## Blocked by

None - can start immediately