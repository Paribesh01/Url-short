import type { AuthResponse, DashboardSummary, ShortUrl, UrlAnalytics, User } from "@/types";
import { getToken } from "@/lib/auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // response had no JSON body, keep the default message
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listShortUrls(): Promise<ShortUrl[]> {
  return request<ShortUrl[]>("/api/urls");
}

export function createShortUrl(payload: {
  url: string;
  custom_code?: string;
  title?: string;
  expires_at?: string;
}): Promise<ShortUrl> {
  return request<ShortUrl>("/api/urls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteShortUrl(shortCode: string): Promise<void> {
  return request<void>(`/api/urls/${shortCode}`, { method: "DELETE" });
}

export function getUrlAnalytics(shortCode: string, days = 30): Promise<UrlAnalytics> {
  return request<UrlAnalytics>(`/api/urls/${shortCode}/analytics?days=${days}`);
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/api/urls/analytics/summary");
}

export function registerUser(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function loginUser(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/api/auth/me");
}

export { ApiError };
