/**
 * Thin fetch wrapper around the CareerFound API.
 *
 * Security note: this MVP stores the JWT access token in localStorage for
 * simplicity, read by `getToken()` below. That is a deliberate, documented
 * tradeoff (see docs/PHASE_2.md) — a production hardening pass should move
 * to an httpOnly, SameSite=strict cookie issued by the backend plus CSRF
 * protection, so a successful XSS can't exfiltrate the token. Nothing else
 * in this client assumes localStorage, so that swap is isolated to
 * `getToken`/`setToken`/`clearToken` here and the login/register calls in
 * AuthProvider.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const TOKEN_KEY = "careerfound_access_token";
const REFRESH_KEY = "careerfound_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

// Shared across concurrent requests so N simultaneous 401s trigger exactly
// one POST /auth/refresh, not N of them.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = typeof window === "undefined" ? null : window.localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    const data = body && typeof body === "object" && "data" in body ? body.data : body;
    if (!data?.access_token || !data?.refresh_token) return false;
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestOptions = {}, isRetryAfterRefresh = false): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    // A 401 on an authenticated request usually just means the short-lived
    // access token expired, not that the user's session is actually over.
    // Try the refresh token once, silently, and retry the original request
    // before giving up — otherwise every user gets logged out every 24h
    // (ACCESS_TOKEN_EXPIRE_MINUTES) instead of the 30-day refresh token
    // ever doing anything. Skip this for /auth/refresh itself and for
    // unauthenticated calls (auth: false), where a 401 is a real answer
    // (e.g. wrong login password), not an expired-token situation.
    if (res.status === 401 && auth && !isRetryAfterRefresh && path !== "/auth/refresh") {
      refreshInFlight = refreshInFlight ?? refreshAccessToken().finally(() => (refreshInFlight = null));
      const refreshed = await refreshInFlight;
      if (refreshed) {
        return request<T>(path, options, true);
      }
      clearTokens();
    }
    const message = body?.error?.message || body?.detail || `Request failed (${res.status})`;
    const code = body?.error?.code || "unknown_error";
    throw new ApiError(message, res.status, code);
  }

  // Envelope-wrapped error responses vs. raw FastAPI response_model bodies:
  // most endpoints return the resource directly (per response_model), while
  // the error path uses the {data, error} envelope. Handle both.
  if (body && typeof body === "object" && "data" in body && "error" in body) {
    return body.data as T;
  }
  return body as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, data?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "PATCH", body: data !== undefined ? JSON.stringify(data) : undefined }),
  del: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "DELETE" }),
};
