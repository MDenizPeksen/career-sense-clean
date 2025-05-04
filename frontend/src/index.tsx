import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'; 
import ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import { Suspense, lazy, StrictMode } from 'react';
import 'antd/dist/reset.css';
import './assets/styles/globals.css';
// Removed redundant CSS imports to follow [TailwindClean] and [NoDuplicates] rules
import i18n from "./translation";

import { ApiCacheProvider } from './context/ApiCacheContext';
import ErrorBoundary from './components/common/ErrorBoundary';

const Router = lazy(() => import("./router"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0a0f1e] text-white">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-xl font-medium">Loading CareerSense...</p>
    </div>
  </div>
);

// Performance monitoring
const reportWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const paintMetrics = performance.getEntriesByType('paint');
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigationTiming) {
          console.log('Page Load Time:', navigationTiming.loadEventEnd - navigationTiming.startTime, 'ms');
          console.log('DOM Content Loaded:', navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime, 'ms');
        }
        
        paintMetrics.forEach(metric => {
          console.log(`${metric.name}:`, metric.startTime, 'ms');
        });
      }, 0);
    });
  }
};

const App = () => (
  <StrictMode>
    <ErrorBoundary>
      <ApiCacheProvider defaultExpiryMs={5 * 60 * 1000}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <Suspense fallback={<LoadingFallback />}>
              <Router />
            </Suspense>
          </I18nextProvider>
        </BrowserRouter>
      </ApiCacheProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Initialize performance monitoring
reportWebVitals();

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container missing in index.html');
}
