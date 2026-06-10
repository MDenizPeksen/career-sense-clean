// Minimal fetch-based API client for the CareerSense backend.
// Base URL comes from VITE_API_URL (no hardcoded host fallback).
import { handleApiResponse, NetworkError } from './errorHandling';

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  // Surface misconfiguration early rather than silently hitting the wrong host.
  console.warn('VITE_API_URL is not set — API requests will fail. Set it in .env.local.');
}

const authHeaders = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, init);
    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      // fetch throws TypeError on network failure / CORS.
      throw new NetworkError();
    }
    throw error;
  }
}

export const apiClient = {
  async get<T>(path: string, token?: string): Promise<T> {
    return request<T>(path, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    });
  },

  async post<T>(path: string, body: unknown, token?: string): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(body),
    });
  },

  // FormData upload — do NOT set Content-Type; the browser adds the boundary.
  async postFormData<T>(path: string, formData: FormData, token?: string): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      headers: { ...authHeaders(token) },
      body: formData,
    });
  },
};
