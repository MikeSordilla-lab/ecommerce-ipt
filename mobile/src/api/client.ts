export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL =
  configuredBaseUrl && configuredBaseUrl.trim().length > 0
    ? configuredBaseUrl.replace(/\/$/, "")
    : "http://localhost/ecommerce-ipt";

let authToken: string | null = null;

export function setApiToken(token: string | null) {
  authToken = token;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const rawBody = await response.text();
  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(rawBody) as ApiResponse<T>;
  } catch {
    const preview = rawBody.trim().slice(0, 160);
    throw new ApiError(
      preview ? `Invalid server response: ${preview}` : "Invalid server response",
      response.status,
      rawBody,
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message || "Request failed", response.status, payload.data);
  }

  return payload.data;
}

export function jsonBody(data: unknown) {
  return JSON.stringify(data);
}
