import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, AlertCircle, ChevronDown, FileText } from 'react-feather';

interface BulletRewrite {
  original: string;
  optimized: string;
}

interface ResumeOptimization {
  bullet_rewrites?: BulletRewrite[];
  ats_keywords_missing?: string[];
  formatting_feedback?: string;
}

interface ResumeOptimizationCardProps {
  optimization: ResumeOptimization;
  delay?: number;
}

const ResumeOptimizationCard: React.FC<ResumeOptimizationCardProps> = ({ 
  optimization,
  delay = 0.4
}) => {
  const [activeRewrite, setActiveRewrite] = useState<number | null>(null);
  
  if (!optimization) {
    return null;
  }

  const hasBulletRewrites = optimization.bullet_rewrites && optimization.bullet_rewrites.length > 0;
  const hasMissingKeywords = optimization.ats_keywords_missing && optimization.ats_keywords_missing.length > 0;
  const hasFormattingFeedback = optimization.formatting_feedback && optimization.formatting_feedback.trim() !== '';

  if (!hasBulletRewrites && !hasMissingKeywords && !hasFormattingFeedback) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-xl shadow-md border border-teal-100 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="bg-teal-100 p-2.5 rounded-full mr-3 shadow-sm">
            <Edit className="text-teal-600" size={22} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Resume Optimization</h2>
        </div>
        
        <div className="space-y-6">
          {/* Bullet Point Rewrites */}
          {hasBulletRewrites && (
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                <FileText className="h-4 w-4 text-teal-500 mr-2" />
                Bullet Point Improvements
              </h3>
              <div className="space-y-4">
                {optimization.bullet_rewrites!.map((rewrite, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: delay + (idx * 0.1) }}
                    className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <button 
                      onClick={() => setActiveRewrite(activeRewrite === idx ? null : idx)}
                      className="w-full text-left bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors flex justify-between items-center"
                      aria-expanded={activeRewrite === idx}
                      aria-controls={`rewrite-panel-${idx}`}
                    >
                      <div className="font-medium text-gray-800 line-clamp-1">{rewrite.original}</div>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${activeRewrite === idx ? 'transform rotate-180' : ''}`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeRewrite === idx && (
                        <motion.div
                          id={`rewrite-panel-${idx}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            <div className="p-4 bg-white border-r border-gray-100">
                              <div className="flex items-center mb-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                                <h5 className="text-sm font-medium text-gray-500">Original</h5>
                              </div>
                              <p className="text-gray-700 pl-4">{rewrite.original}</p>
                            </div>
                            <div className="p-4 bg-teal-50">
                              <div className="flex items-center mb-2">
                                <div className="w-2 h-2 rounded-full bg-teal-500 mr-2"></div>
                                <h5 className="text-sm font-medium text-teal-700">Optimized</h5>
                              </div>
                              <p className="text-gray-800 pl-4 font-medium">{rewrite.optimized}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Missing ATS Keywords */}
          {hasMissingKeywords && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: delay + 0.2 }}
              className="p-4 bg-white rounded-lg border border-red-100 shadow-sm"
            >
              <div className="flex items-start mb-3">
                <AlertCircle size={16} className="text-red-500 mt-1 mr-2" />
                <h3 className="text-md font-semibold text-gray-700">Missing ATS Keywords</h3>
              </div>
              <div className="pl-6">
                <p className="text-sm text-gray-700 mb-3">
                  Your resume is missing these important keywords that recruiters and ATS systems might be looking for:
                </p>
                <div className="flex flex-wrap gap-2">
                  {optimization.ats_keywords_missing!.map((keyword, idx) => (
                    <motion.span 
                      key={idx} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: delay + 0.3 + (idx * 0.05) }}
                      className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                    >
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Formatting Feedback */}
          {hasFormattingFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: delay + 0.3 }}
              className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm"
            >
              <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 text-blue-500 mr-2" />
                Formatting Feedback
              </h3>
              <div className="pl-6">
                <p className="text-gray-700">{optimization.formatting_feedback}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeOptimizationCard;