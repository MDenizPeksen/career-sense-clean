import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, AlertTriangle, Search, CheckSquare, Briefcase } from 'react-feather';
import { CvAnalysis } from '../../../types/analysis'; // Adjust path as needed

/**
 * Props for the AnalysisSection component.
 */
type AnalysisSectionProps = {
  /**
   * The analysis details object containing strengths, improvement areas, etc.
   */
  analysis: CvAnalysis['analysis'];
};

/**
 * Renders the detailed analysis section of the dashboard,
 * including strengths, improvement areas, missing elements, and keyword optimization.
 * 
 * Following the [ComponentSplitting] and [AccessibilityCore] rules.
 */
const AnalysisSection: React.FC<AnalysisSectionProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center" id="strengths-heading">
            <CheckSquare size={18} className="mr-2 text-green-600" /> 
            <span>Strengths</span>
          </h3>
          <div className="space-y-3.5">
            {analysis.strengths.map((item: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="min-w-[8px] h-[8px] rounded-full bg-green-500 mt-1.5 mr-3"></div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Improvement Areas */}
      {analysis.improvement_areas && analysis.improvement_areas.length > 0 && (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center" id="improvement-heading">
            <AlertTriangle size={18} className="mr-2 text-yellow-600" /> 
            <span>Improvement Areas</span>
          </h3>
          <div className="space-y-3.5">
            {analysis.improvement_areas.map((item: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="min-w-[8px] h-[8px] rounded-full bg-yellow-500 mt-1.5 mr-3"></div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Missing Elements */}
      {analysis.missing_elements && analysis.missing_elements.length > 0 && (
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center" id="missing-heading">
            <AlertTriangle size={18} className="mr-2 text-red-600" /> 
            <span>Missing Elements</span>
          </h3>
          <div className="space-y-3.5">
            {analysis.missing_elements.map((item: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="min-w-[8px] h-[8px] rounded-full bg-red-500 mt-1.5 mr-3"></div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Keyword Optimization */}
      {analysis.keyword_optimization && analysis.keyword_optimization.length > 0 && (
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center" id="keyword-heading">
            <Search size={18} className="mr-2 text-indigo-600" /> 
            <span>Keyword Optimization</span>
          </h3>
          <div className="space-y-3.5">
            {analysis.keyword_optimization.map((item: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="min-w-[8px] h-[8px] rounded-full bg-indigo-500 mt-1.5 mr-3"></div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisSection;
