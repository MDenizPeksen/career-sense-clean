import React from 'react';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Compass, AlertTriangle } from 'react-feather';

interface CareerPathsErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

const CareerPathsErrorBoundary: React.FC<CareerPathsErrorBoundaryProps> = ({ children, onReset }) => {
  const handleReset = () => {
    // Clear any Career Paths specific state if needed
    if (onReset) {
      onReset();
    }
  };

  const fallbackUI = (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-indigo-50 rounded-xl border border-indigo-100">
      <div className="relative mb-6">
        <Compass className="w-16 h-16 text-indigo-500" />
        <AlertTriangle className="w-8 h-8 text-amber-500 absolute -bottom-2 -right-2" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Career Paths Exploration Error</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We encountered an issue while loading career path information. This could be due to a temporary connection issue or data availability problem.
      </p>
      <div className="space-y-4 mb-6 max-w-md">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">You can try:</h3>
          <ul className="list-disc pl-5 text-left text-gray-600 space-y-1">
            <li>Refreshing the page</li>
            <li>Checking your internet connection</li>
            <li>Trying again in a few minutes</li>
            <li>Uploading your CV first to get personalized career paths</li>
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

export default CareerPathsErrorBoundary;
