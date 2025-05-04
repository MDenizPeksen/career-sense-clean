import React from 'react';
import { CvAnalysis } from '../../../types/analysis'; // Adjust path as needed

/**
 * Props for the CareerDevelopmentSection component.
 */
type CareerDevelopmentSectionProps = {
  /**
   * The career development insights data object.
   */
  careerInsights: CvAnalysis['career_development_insights'];
};

/**
 * Renders the Career Development Insights section of the dashboard,
 * displaying tips on leveraging strengths, networking, and personal branding.
 */
const CareerDevelopmentSection: React.FC<CareerDevelopmentSectionProps> = ({ careerInsights }) => {
  if (!careerInsights) return null;

  const { strengths_leverage, networking_strategy, personal_branding_tips } = careerInsights;

  return (
    <div className="bg-white p-5 space-y-5">
      {strengths_leverage && (
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Leveraging Your Strengths</h3>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{strengths_leverage}</p>
        </div>
      )}
      {networking_strategy && (
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Networking Strategy</h3>
          <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">{networking_strategy}</p>
        </div>
      )}
      {personal_branding_tips && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Branding</h3>
          <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg border border-purple-100">{personal_branding_tips}</p>
        </div>
      )}
    </div>
  );
};

export default CareerDevelopmentSection;
