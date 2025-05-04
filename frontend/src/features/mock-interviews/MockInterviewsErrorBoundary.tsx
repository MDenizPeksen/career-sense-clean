import React from 'react';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Mic, AlertTriangle } from 'react-feather';

interface MockInterviewsErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

const MockInterviewsErrorBoundary: React.FC<MockInterviewsErrorBoundaryProps> = ({ children, onReset }) => {
  const handleReset = () => {
    // Clear any Mock Interviews specific state if needed
    if (onReset) {
      onReset();
    }
  };

  const fallbackUI = (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-purple-50 rounded-xl border border-purple-100">
      <div className="relative mb-6">
        <Mic className="w-16 h-16 text-purple-500" />
        <AlertTriangle className="w-8 h-8 text-amber-500 absolute -bottom-2 -right-2" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Mock Interview Error</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We encountered an issue with the mock interview system. This feature is still in development and may experience occasional issues.
      </p>
      <div className="space-y-4 mb-6 max-w-md">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Possible solutions:</h3>
          <ul className="list-disc pl-5 text-left text-gray-600 space-y-1">
            <li>Refresh the page and try again</li>
            <li>Check if you have uploaded your CV for personalized interviews</li>
            <li>Try using a different browser</li>
            <li>Ensure your microphone permissions are enabled (if applicable)</li>
          </ul>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/cv-upload"
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Upload CV
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

export default MockInterviewsErrorBoundary;
