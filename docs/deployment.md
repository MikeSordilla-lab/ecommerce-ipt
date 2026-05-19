# Deployment Guide

This guide explains how to deploy the PHP/MySQL e-commerce app to a local XAMPP environment or to a production PHP hosting environment.

## Requirements

- PHP 8.0 or newer recommended
- MySQL or MariaDB
- PDO MySQL extension enabled
- Apache or Nginx with PHP support
- Writable upload directory for product images

## Environment configuration

The app reads configuration from environment variables in `includes/config.php`. If an environment variable is not set, the app falls back to local XAMPP-friendly defaults.

| Variable | Default | Description |
|---|---|---|
| `APP_ENV` | `local` | Use `production` on deployed servers. |
| `APP_DEBUG` | `true` outside production | Shows database connection errors when enabled. Set to `false` in production. |
| `SITE_NAME` | `Shop` | Name shown in page titles and navbar. |
| `SITE_URL` | Auto-detected from the request, or `http://localhost/ecommerce-ipt` in CLI | Full public base URL with no trailing slash. Set explicitly in production. For phone testing, do not leave this pinned to `localhost`; either leave it unset or use your LAN URL. |
| `DB_HOST` | `localhost` | Database host. |
| `DB_PORT` | `3307` on localhost, `3306` on other hosts | Database port. Set explicitly if your database uses a custom port. |
| `DB_NAME` | `ecommerce_ipt` | Database name. |
| `DB_USER` | `root` | Database username. |
| `DB_PASS` | empty | Database password. |
| `DB_CHARSET` | `utf8mb4` | Database charset. |
| `UPLOAD_PATH` | `<project>/uploads/products/` | Server filesystem path for product uploads. |
| `UPLOAD_URL` | `/uploads/products/` | Public URL path for product uploads. |
| `SESSION_COOKIE_SECURE` | `true` only when `APP_ENV=production` and HTTPS is detected | Forces session cookies to HTTPS only. |
| `SESSION_COOKIE_SAMESITE` | `Strict` | Session SameSite policy. |
| `SESSION_COOKIE_LIFETIME` | `0` | Session cookie lifetime in seconds. |
| `SESSION_COOKIE_PATH` | `/` | Session cookie path. |
| `MAIL_HOST` | empty | SMTP host used by PHPMailer for verification emails. |
| `MAIL_PORT` | `587` | SMTP port. |
| `MAIL_USERNAME` | empty | SMTP username. |
| `MAIL_PASSWORD` | empty | SMTP password. |
| `MAIL_FROM_ADDRESS` | `no-reply@example.com` | Sender email address. |
| `MAIL_FROM_NAME` | `SITE_NAME` | Sender display name. |
| `MAIL_ENCRYPTION` | `tls` | Use `tls`, `ssl`, or empty for no encryption. |

## Local XAMPP deployment

1. Copy or clone the project to your XAMPP web root:

   - Windows default: `C:\xampp\htdocs\ecommerce-ipt`

2. Start Apache and MySQL from XAMPP.

3. Create the database:

   - Database name: `ecommerce_ipt`

4. Import the schema:

   - Import `database.sql` using phpMyAdmin or MySQL CLI.

5. Confirm your local database settings.

   Defaults in `includes/config.php` are:

   - `DB_HOST=localhost`
   - `DB_PORT=3307`
   - `DB_NAME=ecommerce_ipt`
   - `DB_USER=root`
   - `DB_PASS=`

   If your XAMPP MySQL runs on port `3306`, set `DB_PORT=3306` in your Apache environment or update your server environment variables.

6. Open the app:

   - `http://localhost/ecommerce-ipt`

   For Expo Go on a physical phone, also test the LAN URL from the phone browser:

   - `http://YOUR-LAN-IP/ecommerce-ipt/api/mobile/health.php`

7. Test the seeded admin account:

   - Username: `admin`
   - Password: `admin123`

## Production deployment

1. Upload the project to your hosting server.

2. Point the web server document root to the project root, or configure the URL path so `index.php`, `pages/`, `api/`, `css/`, `js/`, and `uploads/` are browser-accessible.

3. Create a MySQL/MariaDB database.

4. Import `database.sql`.

5. Configure environment variables on your host.

   Example production values:

   ```text
   APP_ENV=production
   APP_DEBUG=false
   SITE_URL=https://your-domain.com
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASS=your_secure_password
   SESSION_COOKIE_SECURE=true
   SESSION_COOKIE_SAMESITE=Strict
   ```

6. Make upload directories writable by the web server:

   - `uploads/products/`
   - Any profile upload directory used by your profile image feature

7. Ensure HTTPS is enabled.

   The app detects HTTPS using:

   - `$_SERVER['HTTPS']`
   - `HTTP_X_FORWARDED_PROTO=https`
   - `HTTP_X_FORWARDED_SSL=on`

   If your host uses a reverse proxy or load balancer, ensure one of those HTTPS indicators is forwarded correctly.

8. Verify that production error output is disabled:

   - `APP_ENV=production`
   - `APP_DEBUG=false`

9. Verify the mobile API health endpoint before packaging or publishing the app:

   - `https://your-domain.com/ecommerce-ipt/api/mobile/health.php`

## Apache environment variable examples

### `.htaccess` or virtual host

If your host allows Apache `SetEnv`, you can configure values like this:

```apache
SetEnv APP_ENV production
SetEnv APP_DEBUG false
SetEnv SITE_URL https://your-domain.com
SetEnv DB_HOST localhost
SetEnv DB_PORT 3306
SetEnv DB_NAME your_database_name
SetEnv DB_USER your_database_user
SetEnv DB_PASS your_secure_password
SetEnv SESSION_COOKIE_SECURE true
SetEnv MAIL_HOST smtp.example.com
SetEnv MAIL_PORT 587
SetEnv MAIL_USERNAME your_smtp_username
SetEnv MAIL_PASSWORD your_smtp_password
SetEnv MAIL_FROM_ADDRESS no-reply@your-domain.com
SetEnv MAIL_FROM_NAME Shop
SetEnv MAIL_ENCRYPTION tls
```

### Windows/XAMPP Apache virtual host example

In your Apache virtual host configuration:

```apache
<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs/ecommerce-ipt"
    ServerName ecommerce-ipt.local

    SetEnv APP_ENV local
    SetEnv APP_DEBUG true
    SetEnv SITE_URL http://ecommerce-ipt.local
    SetEnv DB_HOST localhost
    SetEnv DB_PORT 3307
    SetEnv DB_NAME ecommerce_ipt
    SetEnv DB_USER root
    SetEnv DB_PASS ""
</VirtualHost>
```

Restart Apache after changing environment variables.

## Upload directory permissions

The product upload directory must exist and be writable:

- `uploads/products/`

On Linux hosting, a common setup is:

```bash
mkdir -p uploads/products
chmod 755 uploads uploads/products
```

If uploads fail, your host may require ownership changes so the PHP/Apache user can write to the directory.

## Production session security

`includes/config.php` starts sessions with secure settings:

- `cookie_httponly = true`
- `cookie_samesite = Strict`
- `use_strict_mode = true`
- `cookie_secure = true` when configured or when production HTTPS is detected

For production HTTPS deployments, set:

```text
SESSION_COOKIE_SECURE=true
```

If you set `SESSION_COOKIE_SECURE=true` on plain HTTP, login sessions will not persist because browsers will not send secure cookies over HTTP.

## Post-deployment checklist

After deployment, verify these flows:

### Guest/auth flow

- Homepage loads.
- User registration works.
- Login works.
- Logout works.
- Seller registration creates pending seller account.
- Admin can approve seller.

### Customer flow

- Product browsing works.
- Category filter works.
- Search works.
- Price filter works.
- Add to cart works.
- Update cart quantity works.
- Remove cart item works.
- Checkout requires delivery details.
- Checkout requires COD confirmation.
- Order saves with payment method `COD`.
- Order details show payment status.

### Seller flow

- Approved seller can add product.
- Seller can edit product.
- Seller can activate/deactivate product.
- Seller can safely delete products with no order history.
- Seller can view and update relevant order statuses.

### Admin flow

- Admin dashboard loads.
- Admin can manage users.
- Admin can approve sellers.
- Admin can activate/deactivate products.
- Admin can safely delete products with no order history.
- Admin can update order statuses.

### Responsive UI

Test at these widths:

- 320px
- 375px
- 414px
- 768px
- Desktop width

Important pages to test:

- Shop
- Product detail
- Cart
- Checkout
- Customer orders
- Admin orders
- Seller products

## Troubleshooting

### Database connection failed

Check:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- Database server is running
- PDO MySQL extension is enabled

### Landing page assets or links point to localhost in production

Check:

- `SITE_URL` is either unset so the app can infer the current host, or set to your exact deployed URL.
- Your deployment did not preserve an old `.htaccess` with a local `SITE_URL`.
- If deploying to a subfolder, `SITE_URL` includes that subfolder.

### Login works locally but not in production

Check:

- `SITE_URL` matches your deployed URL.
- HTTPS is configured correctly.
- `SESSION_COOKIE_SECURE=true` is only used on HTTPS.
- Browser is accepting cookies.

### Product images do not upload

Check:

- `uploads/products/` exists.
- Directory is writable by PHP.
- PHP upload limits are large enough:
  - `upload_max_filesize`
  - `post_max_size`
- File type is JPG, PNG, or WebP.

### API requests fail

Check:

- `SITE_URL` is correct.
- The mobile app was built with `EXPO_PUBLIC_API_BASE_URL` set to the same public or LAN base URL.
- `/api/mobile/health.php` is reachable from the device or emulator.
- User is logged in with the correct role.
- CSRF token is present.
- Browser console/network tab for HTTP status and response body.

## Notes

Do not hardcode production database passwords in source code. Prefer hosting environment variables, Apache `SetEnv`, or server-level secret management.
