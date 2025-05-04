/**
 * Error handling utilities for API requests and general application errors
 */

// Custom error types
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message || 'Network error occurred. Please check your connection.');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  fields?: Record<string, string>;
  
  constructor(message: string, fields?: Record<string, string>) {
    super(message || 'Validation error occurred.');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Handles API fetch errors and converts them to appropriate error types
 */
export async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorData;
    
    try {
      errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse the error as JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ApiError(errorMessage, response.status);
  }
  
  return response.json();
}

/**
 * Wraps fetch API with error handling
 */
export async function fetchWithErrorHandling(
  url: string, 
  options: RequestInit = {}
): Promise<any> {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('Network')) {
      throw new NetworkError('Network error occurred. Please check your connection.');
    }
    
    throw error;
  }
}

/**
 * Formats error messages for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return `API Error (${error.status}): ${error.message}`;
  }
  
  if (error instanceof NetworkError) {
    return error.message;
  }
  
  if (error instanceof ValidationError) {
    if (error.fields) {
      const fieldErrors = Object.entries(error.fields)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
      return `Validation Error: ${fieldErrors}`;
    }
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

/**
 * Logs errors to console and potentially to an error tracking service
 */
export function logError(error: unknown, context: Record<string, any> = {}): void {
  console.error('Error occurred:', error);
  
  // Here you would typically send the error to a service like Sentry
  // Example: Sentry.captureException(error, { extra: context });
  
  // For now, we'll just log to console with context
  if (Object.keys(context).length > 0) {
    console.error('Error context:', context);
  }
}
