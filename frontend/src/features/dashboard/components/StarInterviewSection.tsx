import React, { useState } from 'react';
import { CvAnalysis } from '../../../types/analysis'; // Adjust path as needed
import { Info, ChevronDown, ChevronUp, AlertTriangle } from 'react-feather'; // Import icons

/**
 * Props for the StarInterviewSection component.
 */
type StarInterviewSectionProps = {
  /**
   * An array of STAR interview story objects.
   */
  starStories: CvAnalysis['star_interview_stories'];
};

/**
 * Renders the STAR Interview Stories section of the dashboard,
 * displaying structured examples based on the Situation-Task-Action-Result method.
 * 
 * Following the [ComponentSplitting], [AccessibilityCore], and [ResponsiveFirst] rules.
 */
const StarInterviewSection: React.FC<StarInterviewSectionProps> = ({ starStories }) => {
  // State for tooltips and expanded stories
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [expandedStories, setExpandedStories] = useState<{[key: number]: boolean}>({});

  // Early return after hooks
  if (!starStories || starStories.length === 0) return null;
  
  // Toggle story expansion
  const toggleStory = (index: number) => {
    setExpandedStories(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // STAR method explanations for tooltips
  const starExplanations = {
    situation: "Describe the context and background of the scenario you faced",
    task: "Explain what your responsibility or challenge was in this situation",
    action: "Detail the specific steps you took to address the task",
    result: "Share the outcomes of your actions, using metrics when possible"
  };

  return (
    <div className="bg-white p-5">
      {starStories.map((story, index) => (
        <div key={index} className="mb-4 last:mb-0 border border-amber-100 rounded-lg overflow-hidden shadow-sm">
          {/* Clickable Header */}
          <div 
            className="flex items-center justify-between p-3 bg-amber-50 cursor-pointer"
            onClick={() => toggleStory(index)}
            aria-expanded={expandedStories[index]}
            aria-controls={`star-story-content-${index}`}
          >
            <div className="flex items-center">
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                STAR Story #{index + 1}
              </span>
              <h3 className="text-base font-semibold text-gray-800">
                {story.title || "Interview Example"}
              </h3>
            </div>
            <div className="flex items-center">
              {expandedStories[index] ? (
                <ChevronUp size={20} className="text-amber-700" />
              ) : (
                <ChevronDown size={20} className="text-amber-700" />
              )}
            </div>
          </div>
          
          {/* Expandable Content */}
          {expandedStories[index] && (
            <div 
              id={`star-story-content-${index}`}
              className="p-4 bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Situation */}
                <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-amber-700 mb-1 flex items-center">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-1.5">S</span>
                      Situation:
                    </p>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-1"
                        aria-label="Information about Situation component"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === `info-situation-${index}` ? null : `info-situation-${index}`);
                        }}
                      >
                        <Info size={14} />
                      </button>
                      {activeTooltip === `info-situation-${index}` && (
                        <div className="absolute right-0 top-6 bg-white shadow-lg rounded-md p-2 w-48 text-xs z-10 border border-gray-200">
                          {starExplanations.situation}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">{story.situation}</p>
                </div>
                
                {/* Task */}
                <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-amber-700 mb-1 flex items-center">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-1.5">T</span>
                      Task:
                    </p>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-1"
                        aria-label="Information about Task component"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === `info-task-${index}` ? null : `info-task-${index}`);
                        }}
                      >
                        <Info size={14} />
                      </button>
                      {activeTooltip === `info-task-${index}` && (
                        <div className="absolute right-0 top-6 bg-white shadow-lg rounded-md p-2 w-48 text-xs z-10 border border-gray-200">
                          {starExplanations.task}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">{story.task}</p>
                </div>
                
                {/* Action */}
                <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-amber-700 mb-1 flex items-center">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-1.5">A</span>
                      Action:
                    </p>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-1"
                        aria-label="Information about Action component"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === `info-action-${index}` ? null : `info-action-${index}`);
                        }}
                      >
                        <Info size={14} />
                      </button>
                      {activeTooltip === `info-action-${index}` && (
                        <div className="absolute right-0 top-6 bg-white shadow-lg rounded-md p-2 w-48 text-xs z-10 border border-gray-200">
                          {starExplanations.action}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">{story.action}</p>
                </div>
                
                {/* Result */}
                <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-amber-700 mb-1 flex items-center">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-1.5">R</span>
                      Result:
                    </p>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-1"
                        aria-label="Information about Result component"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(activeTooltip === `info-result-${index}` ? null : `info-result-${index}`);
                        }}
                      >
                        <Info size={14} />
                      </button>
                      {activeTooltip === `info-result-${index}` && (
                        <div className="absolute right-0 top-6 bg-white shadow-lg rounded-md p-2 w-48 text-xs z-10 border border-gray-200">
                          {starExplanations.result}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">{story.result}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Warning Section */}
      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start">
        <div className="text-amber-500 mr-2 mt-0.5">
          <AlertTriangle size={16} />
        </div>
        <div>
          <span className="text-sm font-medium text-amber-700">Important Note:</span> <span className="text-sm text-amber-600">Note that these are AI-generated examples based on your resume. We encourage you to create your authentic stories to perform best in interviews.</span>
        </div>
      </div>
    </div>
  );
};

export default StarInterviewSection;
