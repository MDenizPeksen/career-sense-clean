/**
 * Custom error classes for the CareerSense application
 * Provides consistent error handling across the application
 */

// Base application error
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request - Invalid input
class ValidationError extends AppError {
  constructor(message = 'Validation Error', details = null) {
    super(message, 400, details);
  }
}

// 401 Unauthorized - Authentication required
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

// 403 Forbidden - Not allowed
class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

// 404 Not Found - Resource not found
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// 429 Too Many Requests - Rate limit exceeded
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', details = null) {
    super(message, 429, details);
  }
}

// 500 Internal Server Error - OpenAI API error
class OpenAIError extends AppError {
  constructor(message = 'AI Service Error', details = null, statusCode = 500) {
    super(message, statusCode, details);
  }
}

// 500 Internal Server Error - File processing error
class FileProcessingError extends AppError {
  constructor(message = 'File processing error', details = null) {
    super(message, 400, details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  OpenAIError,
  FileProcessingError
};
