import { fetchWithErrorHandling, logError } from '../utils/errorHandling';

// Define backend URL constant - try to use environment variable with fallback
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * API client for making requests to the backend
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      return await fetchWithErrorHandling(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
    } catch (error) {
      logError(error, { endpoint, method: 'GET' });
      throw error;
    }
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      return await fetchWithErrorHandling(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
    } catch (error) {
      logError(error, { endpoint, method: 'POST', data });
      throw error;
    }
  }

  /**
   * Make a POST request with FormData (for file uploads)
   */
  async postFormData<T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      // Don't set Content-Type header as the browser will set it with the boundary
      const { headers, ...restOptions } = options;
      
      return await fetchWithErrorHandling(url, {
        method: 'POST',
        body: formData,
        ...restOptions,
      });
    } catch (error) {
      logError(error, { endpoint, method: 'POST (FormData)' });
      throw error;
    }
  }

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      return await fetchWithErrorHandling(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
    } catch (error) {
      logError(error, { endpoint, method: 'PUT', data });
      throw error;
    }
  }

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      return await fetchWithErrorHandling(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
    } catch (error) {
      logError(error, { endpoint, method: 'DELETE' });
      throw error;
    }
  }

  /**
   * Check if the backend is online
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get<{ status: string }>('/health');
      return response.status === 'ok';
    } catch (error) {
      logError(error, { method: 'checkHealth' });
      return false;
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient(BACKEND_URL);
export default apiClient;
