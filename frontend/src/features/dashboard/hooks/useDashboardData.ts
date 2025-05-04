import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CvAnalysis } from '../../../types';

/**
 * Interface for the return value of the useDashboardData hook.
 */
interface UseDashboardDataReturn {
  analysisResult: CvAnalysis | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage the state and data fetching for the Dashboard page.
 * Retrieves analysis results from location state, handles loading and error states,
 * and redirects if no analysis data is found.
 * 
 * @returns {UseDashboardDataReturn} An object containing analysisResult, loading state, and error state.
 */
export const useDashboardData = (): UseDashboardDataReturn => {
  const navigate = useNavigate();
  const location = useLocation();

  const [analysisResult, setAnalysisResult] = useState<CvAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.analysisResult) {
      setAnalysisResult(location.state.analysisResult);
      setLoading(false);
    } else {
      setError("No CV analysis found. Please upload your CV first.");
      // Redirect back to home after a delay to allow the user to see the message
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      // Cleanup timer on component unmount or if state changes
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  return { analysisResult, loading, error };
};
