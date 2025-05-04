import { useAuth, useClerk } from '@clerk/clerk-react';
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that shows sign-in modal if user is not authenticated
 * Implements [ComponentSplitting] and [AccessibilityCore] rules
 * @param {ReactNode} children - Child components to render when authenticated
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, userId } = useAuth();
  const { openSignIn } = useClerk();
  const location = useLocation();
  
  // Always place useEffect hooks before any conditional returns
  useEffect(() => {
    if (isLoaded && !userId) {
      openSignIn({
        redirectUrl: location.pathname
      });
    }
  }, [isLoaded, userId, openSignIn, location.pathname]);
  
  // Show loading indicator while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Helper function to get feature information based on path
  const getFeatureInfo = (path: string) => {
    if (path.includes('cv-upload')) {
      return {
        title: 'CV Analysis & Career Insights',
        description: 'Upload your CV to receive personalized career recommendations, skills analysis, and improvement suggestions powered by AI. Sign up and CV analysis are ',
        highlightText: 'completely free!',
        features: [
          'AI-powered CV analysis and scoring',
          'Personalized role recommendations',
          'Skills gap identification',
          'Interview preparation insights'
        ],
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      };
    }
    return {
      title: 'Protected Feature',
      description: 'Sign in to access this exclusive feature and unlock all the benefits of CareerSense. Sign up is ',
      highlightText: 'completely free!',
      features: [],
      icon: null
    };
  };
  
  const featureInfo = getFeatureInfo(location.pathname);
  
  // If not authenticated, show a message prompting to sign in
  if (!userId) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white p-6">
        {/* Authentication Required Box */}
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20 shadow-2xl mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400/30 to-pink-500/30 border border-orange-400/50 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                <circle cx="12" cy="16" r="1"></circle>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-white">Authentication Required</h2>
            
            <p className="text-white/80 mb-6">
              Please sign in to access this feature and unlock all the benefits of CareerSense. Registration is <span className="font-bold text-orange-300">completely free!</span>
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-full"
              onClick={() => openSignIn({ redirectUrl: location.pathname })}
            >
              Sign In
            </motion.button>
          </motion.div>
        </div>
        
        {/* Feature Information Box */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md w-full bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20 shadow-2xl"
        >
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 bg-gradient-to-br from-orange-400/30 to-pink-500/30 p-3 rounded-lg mr-4">
              {featureInfo.icon || (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{featureInfo.title}</h3>
              <p className="text-white/80 text-sm mb-4">
                {featureInfo.description}
                <span className="font-bold text-orange-300">{featureInfo.highlightText}</span>
              </p>
              
              {featureInfo.features.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-sm font-semibold text-orange-300 mb-2">Key Features:</h4>
                  <ul className="text-xs space-y-2">
                    {featureInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        <span className="text-white/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
