import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'react-feather';
import { CvAnalysis } from '../../../types/analysis';

/**
 * Props for the FutureGrowthSection component.
 */
type FutureGrowthSectionProps = {
  /**
   * The future growth potential data object.
   */
  futureGrowth: CvAnalysis['future_growth_potential'];
};

/**
 * Renders the Future Growth Potential section of the dashboard,
 * displaying career trajectory, skills forecast, and industry insights.
 * 
 * Following the [ComponentSplitting] rule from the project guidelines.
 */
const FutureGrowthSection: React.FC<FutureGrowthSectionProps> = ({ futureGrowth }) => {
  // Render nothing if no futureGrowth data is present
  if (!futureGrowth) return null;

  const { career_growth_trajectory, skills_forecast, industry_insights } = futureGrowth || {};

  return (
    <div className="space-y-6">
      {/* Career Growth Trajectory */}
      {career_growth_trajectory && (
        <div className="bg-white rounded-lg border border-purple-100 p-5 hover:shadow-sm transition-shadow">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">Career Growth Trajectory</h3>
          <p className="text-sm text-gray-700 bg-purple-50 p-4 rounded-lg border border-purple-100">
            {career_growth_trajectory}
          </p>
        </div>
      )}

      {/* Skills Forecast */}
      {skills_forecast && skills_forecast.length > 0 && (
        <div className="bg-white rounded-lg border border-green-100 p-5 hover:shadow-sm transition-shadow">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Skills Forecast</h3>
          <div className="flex flex-wrap gap-2">
            {skills_forecast.map((skill: string, index: number) => (
              <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Industry Insights */}
      {industry_insights && industry_insights.length > 0 && (
        <div className="bg-white rounded-lg border border-blue-100 p-5 hover:shadow-sm transition-shadow">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Industry Insights</h3>
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-blue-200 rounded-full"></div>
            <ul className="list-none space-y-3 ml-4">
              {industry_insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start relative">
                  <div className="absolute -left-4 top-1.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureGrowthSection;
