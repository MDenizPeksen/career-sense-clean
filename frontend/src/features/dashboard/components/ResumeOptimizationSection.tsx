import React from 'react';
import { CvAnalysis } from '../../../types/analysis'; // Adjust path as needed
import { motion } from 'framer-motion';

/**
 * Props for the ResumeOptimizationSection component.
 */
interface ResumeOptimizationSectionProps {
  resumeOptimization: CvAnalysis['resume_optimization'];
}

/**
 * Renders the Resume Optimization section of the dashboard,
 * displaying bullet rewrites, missing keywords, formatting feedback, and general recommendations.
 * 
 * Following the [APIStandards] rule from the project guidelines by connecting directly to backend data.
 * Following the [ResponsiveFirst] and [AccessibilityCore] rules for UI design.
 */
const ResumeOptimizationSection: React.FC<ResumeOptimizationSectionProps> = ({ 
  resumeOptimization 
}) => {
  if (!resumeOptimization) return null;

  // Destructure the optimization data
  const { bullet_rewrites, ats_keywords_missing, formatting_feedback, general_recommendations } = resumeOptimization;

  return (
    <div className="space-y-4">
      {/* Bullet Rewrites */}
      {bullet_rewrites && bullet_rewrites.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Bullet Point Rewrites</h3>
          <div className="space-y-3">
            {bullet_rewrites.map((rewrite, index) => (
              <motion.div 
                key={index} 
                className="rounded-lg overflow-hidden border border-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="bg-gray-50 p-3">
                  <p className="text-xs text-gray-500 mb-1">Original:</p>
                  <p className="text-xs text-gray-700 italic">{rewrite.original}</p>
                </div>
                <div className="p-3 bg-green-50">
                  <p className="text-xs text-green-600 mb-1">Optimized:</p>
                  <p className="text-xs text-green-800">{rewrite.optimized}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Keywords Missing */}
      {ats_keywords_missing && ats_keywords_missing.length > 0 && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Missing ATS Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {ats_keywords_missing.map((keyword: string, index: number) => (
              <span key={index} className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {keyword}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Formatting Feedback */}
      {formatting_feedback && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Formatting Feedback</h3>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-gray-700">{formatting_feedback}</p>
          </div>
        </motion.div>
      )}

      {/* General Recommendations */}
      {general_recommendations && general_recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-2">General Recommendations</h3>
          <ul className="space-y-1">
            {general_recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-xs text-gray-700 pl-1">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeOptimizationSection;
