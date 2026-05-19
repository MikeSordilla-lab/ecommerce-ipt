import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const clientSource = readFileSync(resolve(projectRoot, "src/api/client.ts"), "utf8");
const envExample = readFileSync(resolve(projectRoot, ".env.example"), "utf8");

const failures = [];

if (clientSource.includes('"http://localhost/ecommerce-ipt"')) {
  failures.push("client.ts must not silently fall back to localhost for packaged builds.");
}

if (!clientSource.includes("EXPO_PUBLIC_API_BASE_URL")) {
  failures.push("client.ts must read EXPO_PUBLIC_API_BASE_URL.");
}

if (!envExample.includes("EXPO_PUBLIC_API_BASE_URL=http://YOUR-LAN-IP/ecommerce-ipt")) {
  failures.push(".env.example must document the LAN-IP development API URL.");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("API configuration checks passed.");
