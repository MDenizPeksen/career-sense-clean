import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  FileText,
  Upload,
  Loader,
  AlertTriangle,
  Award,
  PieChart,
  Activity,
  Zap,
  Briefcase,
  Globe,
} from "react-feather";
import SubNav from "../../components/layout/SubNav";
import type { CvAnalysis } from "../../types";
import { uploadCV, checkBackendStatus } from "../../api/cv";

// Define constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB size limit

interface FeatureCard {
  title: string;
  text: string;
}

interface AnalysisStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CvUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const location = useLocation();
  const navigate = useNavigate();

  const featureCards: FeatureCard[] = [
    {
      title: " CV Analysis",
      text: "Our AI analyzes your CV to identify strengths, improvement areas, and keyword optimization opportunities.",
    },
    {
      title: "Skills Assessment",
      text: "Get a comprehensive breakdown of your technical and soft skills based on your CV content.",
    },
    {
      title: "Career Insights",
      text: "Receive personalized career insights and recommendations based on your experience and skills.",
    },
  ];

  const analysisSteps: AnalysisStep[] = [
    {
      id: 1,
      title: "Extracting Content",
      description: "Reading and parsing your CV document",
      icon: <FileText size={20} />,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Identifying Strengths",
      description: "Analyzing your skills and achievements",
      icon: <Award size={20} />,
      color: "bg-emerald-500"
    },
    {
      id: 3,
      title: "Finding Opportunities",
      description: "Discovering improvement areas and gaps",
      icon: <AlertTriangle size={20} />,
      color: "bg-amber-500"
    },
    {
      id: 4,
      title: "Matching Roles",
      description: "Finding potential career paths for you",
      icon: <PieChart size={20} />,
      color: "bg-purple-500"
    },
    {
      id: 5,
      title: "Creating Insights",
      description: "Generating personalized recommendations",
      icon: <Zap size={20} />,
      color: "bg-pink-500"
    },
    {
      id: 6,
      title: "Finalizing Results",
      description: "Compiling your comprehensive report",
      icon: <Activity size={20} />,
      color: "bg-teal-500"
    },
  ];

  // Check if backend is online
  useEffect(() => {
    const checkBackendAvailability = async () => {
      try {
        const isOnline = await checkBackendStatus();
        setBackendStatus(isOnline ? 'online' : 'offline');
      } catch (error) {
        console.error('Backend connection error:', error);
        setBackendStatus('offline');
      }
    };

    checkBackendAvailability();
  }, []);

  // Simulate progress through analysis steps
  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    
    if (isLoading) {
      setCurrentStep(1);
      
      stepInterval = setInterval(() => {
        setCurrentStep(prevStep => {
          // Cap at the second-to-last step during loading
          // The last step will be shown when results arrive
          if (prevStep < analysisSteps.length - 1) {
            return prevStep + 1;
          }
          return prevStep;
        });
      }, 2500); // Advance to next step every 2.5 seconds
    } else {
      // When loading is done and we have results, show the final step
      setCurrentStep(0);
    }
    
    return () => {
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [isLoading, analysisSteps.length]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // Validate file type and size
  const validateAndSetFile = (file: File) => {
    // Reset previous errors
    setError(null);

    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    // Set the file if it passes validation
    setUploadedFile(file);
    setCurrentStep(1);
  };

  // Handle file upload and analysis
  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError("Please upload a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentStep(1);

    try {
      // Use the API client instead of direct fetch
      const result = await uploadCV(uploadedFile);
      console.log("API Response in CvUpload (Full):", JSON.stringify(result, null, 2));
      console.log("User Profile Data:", JSON.stringify(result.user_profile, null, 2));
      console.log("Profile Strengths:", JSON.stringify(result.profile_strengths, null, 2));
      console.log("Analysis Data:", JSON.stringify(result.analysis, null, 2));
      
      // Navigate to dashboard with results
      navigate('/dashboard', { state: { analysisResult: result } });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setUploadedFile(null);
    setError(null);
    setCurrentStep(0);
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-6">
      <SubNav currentPath={location.pathname} />
      
      <div className="pt-5">
        {/* Page Title & Description */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">CV Analysis & Optimization</h1>
        <p className="text-center text-gray-600 text-lg max-w-3xl mx-auto mb-10">
          Upload your CV to get AI-powered insights, improvement suggestions, and keyword optimization to help you stand out to recruiters and ATS systems.
        </p>

        {/* Backend Status Warning */}
        {backendStatus === 'offline' && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle className="mr-2 flex-shrink-0 text-red-500" size={20} />
            <p className="text-sm">
              Our analysis service is currently unavailable. Please try again later or contact support if the issue persists.
            </p>
          </div>
        )}

        {/* Upload Area & Analyze Button (Show only when NOT loading) */}
        {!isLoading && (
          <>
            <div 
              className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/20 to-blue-50/50 border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50/70' : 'border-blue-300'} rounded-2xl p-12 mb-6 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50/60 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-pattern-dots-blue opacity-20 pointer-events-none"></div>
              
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              
              <div className="flex flex-col items-center">
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
                      <FileText size={32} />
                    </div>
                    <p className="text-lg text-gray-700 font-semibold text-center px-4 py-2 bg-blue-50/60 rounded-lg border border-blue-100 w-full max-w-md truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={handleReset}
                      className="text-gray-500 hover:text-gray-700 text-sm mt-2"
                    >
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                      <Upload size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload your CV</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Drag and drop your CV here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Analyze Button */}
            {uploadedFile && !isLoading && (
              <div className="flex justify-center mb-8">
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Activity size={20} />
                  Analyze CV
                </motion.button>
              </div>
            )}
          </>
        )}

        {/* Analysis Steps - Loading Indicator (Show only WHEN loading) */}
        {isLoading && (
          <motion.div 
            className="mb-8 mt-2 py-6 px-4 bg-white rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Analyzing Your CV</h3>
            
            <div className="relative flex justify-between items-start max-w-4xl mx-auto">
              {/* Horizontal connector line */}
              <div className="absolute top-[24px] left-[36px] right-[36px] h-[2px] bg-gray-200 z-0"></div>
              
              {/* Progress line that fills as steps complete */}
              <div 
                className="absolute top-[24px] left-[36px] h-[2px] bg-blue-500 z-0 transition-all duration-1000"
                style={{ 
                  width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (analysisSteps.length - 1)) * 100))}%` 
                }}
              ></div>
              
              {/* Step indicators */}
              {analysisSteps.map((step) => (
                <div key={step.id} className="flex flex-col items-center relative z-10 w-[16.666%]">
                  <div 
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                      currentStep >= step.id 
                        ? step.color + ' shadow-md' 
                        : 'bg-white border-2 border-gray-200'
                    }`}
                  >
                    <div className={`${currentStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  <h4 className={`mt-3 text-sm font-medium text-center transition-colors duration-500 ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  
                  <p className="text-xs text-gray-500 text-center mt-1 max-w-[120px] mx-auto">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Loading indicator dots */}
            <div className="flex justify-center items-center mt-8">
              <div className="flex space-x-3">
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
                />
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3, delay: 0.1 }}
                />
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertTriangle className="mr-2 flex-shrink-0 text-red-500" size={20} />
              <div>
                <p className="font-medium">Analysis Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-4 flex-shrink-0 hover:bg-red-100 p-1 rounded transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {featureCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                  <Briefcase size={24} />
                </div>
                <h4 className="text-lg font-bold text-gray-800">{card.title}</h4>
              </div>
              <p className="text-gray-600">{card.text}</p>
            </div>
          ))}
        </div>

        {/* View Dashboard Button */}
        <div className="mt-8 flex justify-center">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            View Full Dashboard
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CvUpload;