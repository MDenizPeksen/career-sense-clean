// Sentry SDK — captureException is a safe no-op when Sentry was never init'd
// (i.e. SENTRY_DSN unset), so this import is harmless in dev/tests.
const Sentry = require('@sentry/node');

/**
 * Global error handling middleware
 * Provides consistent error responses across the application
 * (`_next` is unused but required: Express dispatches error handlers by arity 4.)
 */
const errorHandler = (err, req, res, _next) => {
  // Log error details for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Report genuine server faults to Sentry (skip expected 4xx client errors so
  // validation/auth/not-found noise doesn't drown out real bugs).
  if (statusCode >= 500) {
    Sentry.captureException(err);
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
      details = 'The uploaded file exceeds the maximum allowed size.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
      details = 'The field name in the form does not match the expected field name.';
    } else {
      message = 'File upload error';
      details = err.message;
    }
  } 
  // Handle OpenAI API errors
  else if (err.name === 'OpenAIError' || (err.response && err.response.status)) {
    statusCode = err.response?.status || 500;
    message = 'AI Service Error';
    
    if (err.response?.data?.error?.message) {
      details = err.response.data.error.message;
    } else if (err.response?.statusText) {
      details = err.response.statusText;
    } else {
      details = err.message;
    }
    
    // Handle specific OpenAI error codes
    if (statusCode === 429) {
      message = 'AI Service Rate Limit Exceeded';
      details = 'The service is currently experiencing high demand. Please try again later.';
    } else if (statusCode === 401) {
      message = 'AI Service Authentication Error';
      details = 'There was an issue with the API key. Please contact support.';
    }
  }
  // Handle SyntaxError (e.g., invalid JSON)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON';
    details = 'The request body contains invalid JSON.';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    details: details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
