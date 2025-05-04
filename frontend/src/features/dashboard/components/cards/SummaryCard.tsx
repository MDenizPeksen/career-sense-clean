import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, TrendingUp } from 'react-feather';

interface SummaryCardProps {
  overallScore?: number;
  recruiterSummary?: string;
  delay?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  overallScore = 75,
  recruiterSummary,
  delay = 0
}) => {
  // Default summary text if none is provided
  const defaultSummary = "Your CV demonstrates strong technical skills and relevant experience. Focus on quantifying achievements and tailoring to specific job requirements for optimal results.";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mb-10 relative overflow-hidden"
    >
      <div className="absolute -z-10 inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-70"></div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-2xl"></div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/20 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-3/4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileText size={20} className="text-white" />
              </div>
              <h2 className="ml-4 text-2xl font-bold text-gray-800">CV Analysis Summary</h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.5 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed mb-6 pl-2 border-l-4 border-blue-400 py-1">
                {recruiterSummary || defaultSummary}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.5, duration: 0.4 }}
                  className="flex items-center bg-blue-50 px-4 py-2 rounded-full shadow-sm"
                >
                  <Award size={16} className="text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">Professional Profile</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.6, duration: 0.4 }}
                  className="flex items-center bg-indigo-50 px-4 py-2 rounded-full shadow-sm"
                >
                  <TrendingUp size={16} className="text-indigo-600 mr-2" />
                  <span className="text-indigo-800 font-medium">Career Growth</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full md:w-1/4 flex justify-center">
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.5, type: "spring" }}
                className="relative w-32 h-32"
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#circleGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 283" }}
                    animate={{ strokeDasharray: `${overallScore * 2.83} 283` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.4 }}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.8, duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center flex-col"
                >
                  <span className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {overallScore}%
                  </span>
                  <span className="text-sm font-medium text-gray-500">Overall Score</span>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: delay + 1.2, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
                className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
              >
                TOP 25%
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryCard; 