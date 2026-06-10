const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { FileProcessingError, ValidationError } = require('../utils/errors');

// Extract text from file based on mimetype
const extractTextFromFile = async (file) => {
  try {
    if (!file || !file.path || !file.mimetype) {
      throw new ValidationError(
        'Invalid file object', 
        'The file object is missing required properties (path, mimetype)'
      );
    }

    const filePath = file.path;
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new FileProcessingError(
        'File not found', 
        `The file at path ${filePath} does not exist or cannot be accessed`
      );
    }
    
    let extractedText = '';

    if (file.mimetype === 'application/pdf') {
      try {
        // Extract text from PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
        console.log(`PDF text extracted, length: ${extractedText.length} characters`);
      } catch (pdfError) {
        throw new FileProcessingError(
          'PDF parsing failed', 
          pdfError.message || 'Could not extract text from the PDF file'
        );
      }
    } 
    else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             file.mimetype === 'application/msword') {
      try {
        // Extract text from DOCX/DOC
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
        console.log(`Word document text extracted, length: ${extractedText.length} characters`);
      } catch (docError) {
        throw new FileProcessingError(
          'Word document parsing failed', 
          docError.message || 'Could not extract text from the Word document'
        );
      }
    } 
    else {
      throw new ValidationError(
        'Unsupported file type', 
        `The file type ${file.mimetype} is not supported. Please upload a PDF, DOC, or DOCX file.`
      );
    }

    // Validate extracted text
    if (!extractedText || extractedText.length < 50) {
      throw new FileProcessingError(
        'Insufficient text content', 
        'The extracted text is too short or empty. Please check your file content and ensure it contains readable text.'
      );
    }

    return extractedText;
  } catch (error) {
    // If it's already our custom error, just rethrow it
    if (error instanceof ValidationError || error instanceof FileProcessingError) {
      throw error;
    }
    
    console.error('Error extracting text from file:', error);
    throw new FileProcessingError(
      'Text extraction failed', 
      error.message || 'An unexpected error occurred while processing the file'
    );
  }
};

// Delete file
const deleteFile = (filePath) => {
  try {
    if (!filePath) {
      console.warn('No file path provided for deletion');
      return;
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filePath}`);
    } else {
      console.warn(`File not found for deletion: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    // We don't throw here because file deletion is a cleanup operation
    // and shouldn't interrupt the main flow if it fails
  }
};

// Sweep orphaned upload files left behind by crashes/timeouts.
// Deletes files in the uploads directory older than maxAgeMs (default 1 hour).
const sweepStaleUploads = (uploadsDir, maxAgeMs = 60 * 60 * 1000) => {
  try {
    if (!fs.existsSync(uploadsDir)) return;
    const now = Date.now();
    let removed = 0;
    for (const name of fs.readdirSync(uploadsDir)) {
      if (name === '.gitkeep') continue;
      const filePath = path.join(uploadsDir, name);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          removed += 1;
        }
      } catch (err) {
        console.error(`Failed to sweep upload ${filePath}:`, err.message);
      }
    }
    if (removed > 0) {
      console.log(`🧹 Swept ${removed} stale upload file(s) from ${uploadsDir}`);
    }
  } catch (error) {
    console.error('Error sweeping stale uploads:', error.message);
  }
};

module.exports = {
  extractTextFromFile,
  deleteFile,
  sweepStaleUploads
};
