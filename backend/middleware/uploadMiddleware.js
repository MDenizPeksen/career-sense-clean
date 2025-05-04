const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serverConfig = require('../config/server');

// File size limit from config
const MAX_FILE_SIZE = serverConfig.fileUpload.maxSize;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = serverConfig.fileUpload.allowedTypes;
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a PDF, DOC, or DOCX file.`), false);
  }
};

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  MAX_FILE_SIZE
};
