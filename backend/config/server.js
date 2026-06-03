// Server configuration

// Parse comma-separated ALLOWED_ORIGINS into a CORS origin value.
// "*" (or unset in development) allows all; otherwise an explicit allowlist.
const parseAllowedOrigins = () => {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw || raw.trim() === '') {
    // No allowlist configured: permissive in dev, but should be set in production.
    return '*';
  }
  const origins = raw.split(',').map((o) => o.trim()).filter(Boolean);
  if (origins.includes('*')) return '*';
  return origins;
};

module.exports = {
  port: process.env.PORT || 5001,
  cors: {
    origin: parseAllowedOrigins(),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
};
