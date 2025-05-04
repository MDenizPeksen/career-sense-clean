import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, AlertCircle } from 'react-feather';

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
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center mb-4">
        <Edit className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Resume Optimization</h2>
      </div>

      {optimization.bullet_rewrites && (
        <div className="mb-6">
          <h3 className="text-gray-700 font-medium mb-2">Bullet Rewrites</h3>
          <ul className="space-y-2">
            {optimization.bullet_rewrites.map((rewrite, index) => (
              <li key={index} className="flex flex-col">
                <span className="text-sm text-gray-600">Original: {rewrite.original}</span>
                <span className="text-sm text-green-600">Optimized: {rewrite.optimized}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {optimization.ats_keywords_missing && (
        <div className="mb-6">
          <h3 className="text-red-600 font-medium mb-2">Missing ATS Keywords</h3>
          <ul className="space-y-1">
            {optimization.ats_keywords_missing.map((keyword, index) => (
              <li key={index} className="text-sm text-gray-600">{keyword}</li>
            ))}
          </ul>
        </div>
      )}

      {optimization.formatting_feedback && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-sm text-gray-700">{optimization.formatting_feedback}</p>
        </div>
      )}
    </motion.div>
  );
};

export default ResumeOptimizationCard;