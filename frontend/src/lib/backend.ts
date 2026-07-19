const DEFAULT_BACKEND_URL = "http://localhost:8000";

export function getBackendBaseUrl() {
  return import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;
}

export async function backendRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Client-Source": "frontend",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const fullUrl = `${getBackendBaseUrl()}${path}`;
  console.log(`[backendRequest] ${method} ${fullUrl}`, body ? JSON.stringify(body).slice(0, 200) : "(no body)");

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log(`[backendRequest] Response status: ${response.status}`);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload?.error || payload?.detail || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export async function backendPost<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  return backendRequest("POST", path, body, accessToken);
}

export async function backendGet<T>(path: string, accessToken?: string): Promise<T> {
  return backendRequest("GET", path, undefined, accessToken);
}
