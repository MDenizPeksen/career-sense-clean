import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  FileText,
  Upload,
  AlertTriangle,
  Award,
  PieChart,
  Activity,
  Zap,
  Briefcase,
} from 'lucide-react';
import { uploadCV, checkBackendStatus, validateCvFile } from '../../api/cv';

interface AnalysisStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const featureCards = [
  {
    title: 'CV Analysis',
    text: 'Our AI analyzes your CV to identify strengths, improvement areas, and keyword optimization opportunities.',
  },
  {
    title: 'Skills Assessment',
    text: 'Get a comprehensive breakdown of your technical and soft skills based on your CV content.',
  },
  {
    title: 'Career Insights',
    text: 'Receive personalized career insights and recommendations based on your experience and skills.',
  },
];

const analysisSteps: AnalysisStep[] = [
  { id: 1, title: 'Extracting Content', description: 'Reading and parsing your CV document', icon: <FileText size={20} />, color: 'bg-blue-500' },
  { id: 2, title: 'Identifying Strengths', description: 'Analyzing your skills and achievements', icon: <Award size={20} />, color: 'bg-emerald-500' },
  { id: 3, title: 'Finding Opportunities', description: 'Discovering improvement areas and gaps', icon: <AlertTriangle size={20} />, color: 'bg-amber-500' },
  { id: 4, title: 'Matching Roles', description: 'Finding potential career paths for you', icon: <PieChart size={20} />, color: 'bg-purple-500' },
  { id: 5, title: 'Creating Insights', description: 'Generating personalized recommendations', icon: <Zap size={20} />, color: 'bg-pink-500' },
  { id: 6, title: 'Finalizing Results', description: 'Compiling your comprehensive report', icon: <Activity size={20} />, color: 'bg-teal-500' },
];

const CvUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    checkBackendStatus()
      .then((online) => setBackendStatus(online ? 'online' : 'offline'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  // Advance the animated progress while analysis runs.
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }
    setCurrentStep(1);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const validateAndSetFile = (file: File) => {
    setError(null);
    const { valid, error: validationError } = validateCvFile(file);
    if (!valid) {
      setError(validationError ?? 'Invalid file.');
      return;
    }
    setUploadedFile(file);
    setCurrentStep(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) validateAndSetFile(files[0]);
  };

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
    if (files && files.length > 0) validateAndSetFile(files[0]);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setCurrentStep(1);
    try {
      const token = await getToken();
      const result = await uploadCV(uploadedFile, token ?? undefined);
      navigate('/dashboard', { state: { analysisResult: result } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setError(null);
    setCurrentStep(0);
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-6">
      <div className="pt-5">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">CV Analysis &amp; Optimization</h1>
        <p className="text-center text-gray-600 text-lg max-w-3xl mx-auto mb-10">
          Upload your CV to get AI-powered insights, improvement suggestions, and keyword optimization to help you stand
          out to recruiters and ATS systems.
        </p>

        {backendStatus === 'offline' && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle className="mr-2 flex-shrink-0 text-red-500" size={20} />
            <p className="text-sm">
              Our analysis service is currently unavailable. Please try again later or contact support if the issue
              persists.
            </p>
          </div>
        )}

        {!isLoading && (
          <>
            <div
              className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/20 to-blue-50/50 border-2 border-dashed ${
                isDragging ? 'border-blue-500 bg-blue-50/70' : 'border-blue-300'
              } rounded-2xl p-12 mb-6 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50/60 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
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
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={handleReset} className="text-gray-500 hover:text-gray-700 text-sm mt-2">
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                      <Upload size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload your CV</h3>
                    <p className="text-gray-600 text-center mb-4">Drag and drop your CV here, or click to browse</p>
                    <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {uploadedFile && (
              <div className="flex justify-center mb-8">
                <motion.button
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg"
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

        {isLoading && (
          <motion.div
            className="mb-8 mt-2 py-6 px-4 bg-white rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Analyzing Your CV</h3>
            <div className="relative flex justify-between items-start max-w-4xl mx-auto">
              <div className="absolute top-[24px] left-[36px] right-[36px] h-[2px] bg-gray-200 z-0" />
              <div
                className="absolute top-[24px] left-[36px] h-[2px] bg-blue-500 z-0 transition-all duration-1000"
                style={{ width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (analysisSteps.length - 1)) * 100))}%` }}
              />
              {analysisSteps.map((step) => (
                <div key={step.id} className="flex flex-col items-center relative z-10 w-[16.666%]">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                      currentStep >= step.id ? step.color + ' shadow-md' : 'bg-white border-2 border-gray-200'
                    }`}
                  >
                    <div className={currentStep >= step.id ? 'text-white' : 'text-gray-400'}>{step.icon}</div>
                  </div>
                  <h4
                    className={`mt-3 text-sm font-medium text-center transition-colors duration-500 ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500 text-center mt-1 max-w-[120px] mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
            <button onClick={() => setError(null)} className="ml-4 flex-shrink-0 hover:bg-red-100 p-1 rounded transition-colors">
              ✕
            </button>
          </motion.div>
        )}

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
      </div>
    </div>
  );
};

export default CvUpload;
