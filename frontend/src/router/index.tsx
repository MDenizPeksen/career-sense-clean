import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { Styles } from "../assets/styles/styles";
import ErrorBoundary from "../components/common/ErrorBoundary";
import CvUploadErrorBoundary from "../features/cv-upload/CvUploadErrorBoundary";
import CareerPathsErrorBoundary from "../features/career-paths/CareerPathsErrorBoundary";
import MockInterviewsErrorBoundary from "../features/mock-interviews/MockInterviewsErrorBoundary";
import { ClerkContextProvider } from "../context/ClerkContext";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Lazy load feature pages
const Home = lazy(() => import("../features/home/ContentHome"));
const CareerPaths = lazy(() => import("../features/career-paths/CareerPaths"));
const CvUpload = lazy(() => import("../features/cv-upload/CvUpload"));
const MockInterviews = lazy(() => import("../features/mock-interviews/MockInterviews"));
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const PrivacyPolicy = lazy(() => import("../features/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../features/legal/TermsOfService"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0a0f1e] text-white">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-xl font-medium">Loading...</p>
    </div>
  </div>
);

const Router = () => {
  return (
    <ErrorBoundary>
      <ClerkContextProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Styles />
          <Header />
          <main className="min-h-screen bg-white">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              } />
              
              {/* Career Paths - Public */}
              <Route path="/career-paths" element={
                <CareerPathsErrorBoundary>
                  <CareerPaths />
                </CareerPathsErrorBoundary>
              } />
              
              {/* Mock Interviews - Public */}
              <Route path="/mock-interviews" element={
                <MockInterviewsErrorBoundary>
                  <MockInterviews />
                </MockInterviewsErrorBoundary>
              } />
              
              {/* Protected Routes */}
              <Route path="/cv-upload" element={
                <CvUploadErrorBoundary>
                  <ProtectedRoute>
                    <CvUpload />
                  </ProtectedRoute>
                </CvUploadErrorBoundary>
              } />
              <Route path="/dashboard" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              {/* Legal Pages */}
              <Route path="/privacy-policy" element={
                <ErrorBoundary>
                  <PrivacyPolicy />
                </ErrorBoundary>
              } />
              <Route path="/terms-of-service" element={
                <ErrorBoundary>
                  <TermsOfService />
                </ErrorBoundary>
              } />
            </Routes>
          </main>
          <Footer />
        </Suspense>
      </ClerkContextProvider>
    </ErrorBoundary>
  );
};

export default Router;