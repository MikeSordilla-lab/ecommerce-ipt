# Shop Mobile

Expo Go and APK companion app for the PHP ecommerce project.

## Run

1. Install dependencies from `mobile/`:

   ```bash
   npm install
   ```

2. Copy `.env.development.example` to `.env` and set your XAMPP computer LAN IP:

   ```text
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10/ecommerce-ipt
   ```

3. In your PHP `.htaccess` or virtual host, do not hardcode `SITE_URL` to `localhost` while testing on a phone. Leave it unset so the API can infer `http://192.168.x.x/ecommerce-ipt`, or set it to the same LAN URL used above.

4. Check the API from your phone browser:

   ```text
   http://192.168.1.10/ecommerce-ipt/api/mobile/health.php
   ```

   The response should include `"status":"ok"` and a `site_url` that uses the same host your phone can reach.

5. Start Expo:

   ```bash
   npm start
   ```

6. Scan the QR code with Expo Go.

Your phone and XAMPP computer must be on the same Wi-Fi network for local testing.

## APK / production build

Before building a release APK, set the production API host at build time:

```text
EXPO_PUBLIC_API_BASE_URL=https://your-domain.com/ecommerce-ipt
```

Expo inlines `EXPO_PUBLIC_*` values into the app bundle. Rebuild the APK whenever this value changes.

For production PHP hosting, set `SITE_URL` to the public HTTPS URL, for example:

```text
SITE_URL=https://your-domain.com/ecommerce-ipt
```

Smoke test this URL before building or installing the APK:

```text
https://your-domain.com/ecommerce-ipt/api/mobile/health.php
```

Run these checks from `mobile/` before packaging:

```bash
npm run verify:api-config
npm run typecheck
```
