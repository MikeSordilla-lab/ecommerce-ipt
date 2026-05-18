# Hostinger Deployment Guide

This guide is specific to deploying this PHP/MySQL e-commerce app on Hostinger shared hosting using hPanel.

## 1. Prepare the project locally

Before uploading, make sure these files and folders are included:

- `api/`
- `css/`
- `docs/`
- `includes/`
- `js/`
- `pages/`
- `uploads/`
- `database.sql`
- `index.php`

Do not upload development-only folders if they are not needed on hosting, such as worktrees or scratch folders.

## 2. Create the Hostinger database

1. Log in to Hostinger hPanel.
2. Open your website dashboard.
3. Go to Databases → MySQL Databases.
4. Create a new database and user.
5. Save these values securely:

   - Database name
   - Database username
   - Database password
   - Database host, usually `localhost`
   - Database port, usually `3306`

## 3. Import the database schema

1. In hPanel, go to Databases.
2. Open phpMyAdmin for the database you created.
3. Select the database.
4. Use Import.
5. Upload and import `database.sql`.

After import, confirm these tables exist:

- `users`
- `categories`
- `products`
- `addresses`
- `cart_items`
- `orders`
- `order_items`

## 4. Upload files to Hostinger

You can upload using File Manager or FTP.

### Option A: File Manager

1. Open hPanel → File Manager.
2. Go to your domain's `public_html` directory.
3. Upload the project files.
4. If uploading a ZIP, extract it.
5. Make sure `index.php` is directly accessible in the web root you want to serve.

For a primary domain, the common structure is:

```text
public_html/index.php
public_html/api/
public_html/css/
public_html/includes/
public_html/js/
public_html/pages/
public_html/uploads/
```

If you place the app in a subfolder, for example `public_html/ecommerce-ipt`, then set `SITE_URL` with that path. If `SITE_URL` is not configured, the app infers the base URL from the current request, which works for normal domain-root and subfolder deployments.

## 5. Configure environment variables

The app reads settings from environment variables in `includes/config.php`.

On Hostinger shared hosting, the easiest approach is to use Apache `SetEnv` entries in `.htaccess` if your plan supports them.

Create or edit `.htaccess` in the same directory as `index.php`.

Example for deployment at the domain root:

```apache
SetEnv APP_ENV production
SetEnv APP_DEBUG false
SetEnv SITE_URL https://your-domain.com
SetEnv DB_HOST localhost
SetEnv DB_PORT 3306
SetEnv DB_NAME your_hostinger_database_name
SetEnv DB_USER your_hostinger_database_user
SetEnv DB_PASS your_hostinger_database_password
SetEnv SESSION_COOKIE_SECURE true
SetEnv SESSION_COOKIE_SAMESITE Strict
```

Example for deployment inside a subfolder:

```apache
SetEnv APP_ENV production
SetEnv APP_DEBUG false
SetEnv SITE_URL https://your-domain.com/ecommerce-ipt
SetEnv DB_HOST localhost
SetEnv DB_PORT 3306
SetEnv DB_NAME your_hostinger_database_name
SetEnv DB_USER your_hostinger_database_user
SetEnv DB_PASS your_hostinger_database_password
SetEnv SESSION_COOKIE_SECURE true
SetEnv SESSION_COOKIE_SAMESITE Strict
```

Important:

- Replace all placeholder values.
- Do not commit or publicly share `.htaccess` if it contains real database passwords.
- If `SetEnv` is disabled on your plan, ask Hostinger support for the recommended way to define PHP environment variables, or temporarily set values directly in `includes/config.php` for that deployment.

## 6. Configure HTTPS

1. Enable SSL for your domain in hPanel.
2. Use the HTTPS URL in `SITE_URL`.
3. Set `SESSION_COOKIE_SECURE=true` only after HTTPS is working.

If `SESSION_COOKIE_SECURE=true` is enabled while using plain HTTP, login sessions will not persist.

## 7. Configure upload folder permissions

Make sure this directory exists:

```text
uploads/products/
```

The directory must be writable by PHP.

In Hostinger File Manager, check folder permissions. Usually `755` works for folders. If uploads fail, use Hostinger's file permission tools or contact support.

## 8. Test the deployment

### Basic test

1. Open your site URL.
2. Confirm homepage loads.
3. Log in using seeded admin account:

   - Username: `admin`
   - Password: `admin123`

Change the admin password after deployment.

### Customer flow test

1. Register a customer account.
2. Browse products.
3. Add a product to cart.
4. Update quantity.
5. Checkout.
6. Confirm COD checkbox.
7. Place order.
8. Confirm order detail shows:

   - Cash on Delivery
   - To Pay on Delivery
   - Pending order status

### Seller flow test

1. Register as seller.
2. Log in as admin.
3. Approve seller.
4. Log in as seller.
5. Add product.
6. Edit product.
7. Deactivate and reactivate product.

### Admin flow test

1. View users.
2. Approve sellers.
3. View products.
4. Deactivate/reactivate product.
5. View orders.
6. Update order status from Pending to Shipped to Delivered.

## 9. Common Hostinger issues

### Landing page CSS or links point to localhost

Check:

- Your `.htaccess` does not contain an old local `SITE_URL`.
- `SITE_URL` is either unset so the app can infer the Hostinger URL, or set to the exact public URL.
- If the app is deployed in a subfolder, include that subfolder in `SITE_URL`.

### Database connection failed

Check these `.htaccess` values:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

Hostinger database names and usernames often include prefixes. Use the exact values shown in hPanel.

### Login redirects but does not stay logged in

Check:

- `SITE_URL` exactly matches your public URL.
- SSL is working.
- `SESSION_COOKIE_SECURE=true` is only used on HTTPS.
- Browser cookies are enabled.

### Product images fail to upload

Check:

- `uploads/products/` exists.
- Folder is writable.
- Uploaded file type is JPG, PNG, or WebP.
- PHP upload limits are high enough.

Hostinger allows some PHP settings to be adjusted in hPanel or `.htaccess`, depending on your plan.

### 500 Internal Server Error after editing `.htaccess`

Possible causes:

- Incorrect `.htaccess` syntax.
- `SetEnv` not allowed on your plan.
- Unsupported PHP directives.

Temporarily remove recent `.htaccess` changes and reload the site. Then re-add one setting at a time.

## 10. Recommended production cleanup

After the site is working:

1. Change the seeded admin password.
2. Set `APP_DEBUG=false`.
3. Remove unused development folders from hosting.
4. Confirm directory listing is disabled.
5. Keep `database.sql` private if it contains real production data.
6. Regularly back up the database from hPanel.
