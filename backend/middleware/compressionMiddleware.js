/**
 * Compression middleware configuration
 * Reduces response size for improved network performance
 */

const compression = require('compression');

/**
 * Configure compression middleware with optimal settings
 * Only compress responses larger than 1KB
 * Skip compression for already compressed formats
 */
const compressionMiddleware = compression({
  // Compression level (1-9, where 9 is maximum compression)
  level: 6,
  
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Don't compress these MIME types as they're already compressed
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      // Don't compress responses with this request header
      return false;
    }
    
    // Skip compression for already compressed formats
    const contentType = res.getHeader('Content-Type') || '';
    if (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip') ||
      contentType.includes('application/x-gzip') ||
      contentType.includes('application/pdf')
    ) {
      return false;
    }
    
    // Use compression for all other response types
    return compression.filter(req, res);
  }
});

module.exports = compressionMiddleware;
