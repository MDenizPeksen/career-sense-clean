import apiClient from './apiClient';
import { CvAnalysis } from '../types/analysis';

/**
 * Service for CV analysis related API calls
 */
export const cvAnalysisService = {
  /**
   * Analyze a CV file
   * @param file The CV file to analyze
   * @returns The analysis result
   */
  async analyzeCV(file: File): Promise<CvAnalysis> {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiClient.postFormData<CvAnalysis>('/analyze', formData);
  },
  
  /**
   * Get supported file formats for CV upload
   * @returns Array of supported file formats
   */
  getSupportedFormats(): string[] {
    return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  },
  
  /**
   * Check if a file is valid for CV analysis
   * @param file The file to check
   * @param maxSize Maximum file size in bytes (default: 10MB)
   * @returns Object containing validation result and error message if any
   */
  validateFile(file: File, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = this.getSupportedFormats();
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload a PDF, DOC, or DOCX file."
      };
    }
    
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
      };
    }
    
    return { valid: true };
  }
};
