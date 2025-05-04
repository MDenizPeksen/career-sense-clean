import React from 'react';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { FileText, AlertTriangle } from 'react-feather';

interface CvUploadErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

const CvUploadErrorBoundary: React.FC<CvUploadErrorBoundaryProps> = ({ children, onReset }) => {
  const handleReset = () => {
    // Clear any CV upload specific state if needed
    if (onReset) {
      onReset();
    }
  };

  const fallbackUI = (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-blue-50 rounded-xl border border-blue-100">
      <div className="relative mb-6">
        <FileText className="w-16 h-16 text-blue-500" />
        <AlertTriangle className="w-8 h-8 text-red-500 absolute -bottom-2 -right-2" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">CV Analysis Error</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We encountered an issue while processing your CV. This could be due to a temporary system error or an issue with the file format.
      </p>
      <div className="space-y-4 mb-6 max-w-md">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Troubleshooting Tips:</h3>
          <ul className="list-disc pl-5 text-left text-gray-600 space-y-1">
            <li>Make sure your file is in PDF, DOC, or DOCX format</li>
            <li>Check that the file size is under 10MB</li>
            <li>Ensure the document isn't password protected</li>
            <li>Try a different browser or clear your cache</li>
          </ul>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/contact"
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
};

export default CvUploadErrorBoundary;
