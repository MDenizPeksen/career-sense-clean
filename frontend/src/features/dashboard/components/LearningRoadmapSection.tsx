import React from 'react';
import { CvAnalysis } from '../../../types/analysis';
import { Clock, Award, BookOpen } from 'react-feather';

/**
 * Props for the LearningRoadmapSection component.
 */
type LearningRoadmapSectionProps = {
  /**
   * An array of personalized learning roadmap items (courses, platforms, etc.).
   */
  learningRoadmap: CvAnalysis['personalized_learning_roadmap'];
};

/**
 * Renders the Personalized Learning Roadmap section of the dashboard,
 * displaying recommended courses and learning resources.
 * 
 * Following the [ComponentSplitting] and [ResponsiveFirst] rules from the project guidelines.
 */
const LearningRoadmapSection: React.FC<LearningRoadmapSectionProps> = ({ learningRoadmap }) => {
  if (!learningRoadmap || learningRoadmap.length === 0) return null;

  // Ensure we have 3 learning roadmap items
  const defaultLearningItems = [
    {
      course: "Data Analysis and Visualization with Python",
      platform: "Coursera",
      impact: "This course will enhance your data analysis skills and improve your ability to visualize data effectively.",
      difficulty: "Intermediate",
      duration: "4 weeks"
    },
    {
      course: "Strategic Leadership and Management",
      platform: "LinkedIn Learning",
      impact: "Develop essential leadership skills to advance your career and lead teams more effectively.",
      difficulty: "Intermediate",
      duration: "6 weeks"
    },
    {
      course: "Advanced Excel for Business Analytics",
      platform: "Udemy",
      impact: "Master advanced Excel functions and data analysis techniques that are highly valued in business environments.",
      difficulty: "Beginner to Intermediate",
      duration: "3 weeks"
    }
  ];

  // Create an enhanced roadmap with at least 3 items
  const enhancedRoadmap = [...learningRoadmap];
  while (enhancedRoadmap.length < 3) {
    const index = enhancedRoadmap.length;
    enhancedRoadmap.push(defaultLearningItems[index % defaultLearningItems.length]);
  }

  // Platform icons mapping
  const getPlatformIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('coursera')) return '🎓';
    if (lowerPlatform.includes('udemy')) return '💻';
    if (lowerPlatform.includes('linkedin')) return '🔗';
    if (lowerPlatform.includes('edx')) return '🌐';
    if (lowerPlatform.includes('khan')) return '📚';
    return '📱';
  };

  // Difficulty color mapping
  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return 'text-gray-500';
    
    const lowerDifficulty = difficulty.toLowerCase();
    if (lowerDifficulty.includes('beginner')) return 'text-green-600';
    if (lowerDifficulty.includes('intermediate')) return 'text-blue-600';
    if (lowerDifficulty.includes('advanced')) return 'text-purple-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {enhancedRoadmap.map((item, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-xl mr-2">{getPlatformIcon(item.platform)}</span>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Platform: {item.platform}</p>
                  <h4 className="text-sm font-semibold text-gray-800">{item.course}</h4>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-3">{item.impact}</p>
              
              <div className="flex justify-between text-xs mt-2">
                {item.difficulty && (
                  <div className="flex items-center">
                    <Award size={12} className="mr-1 text-gray-400" />
                    <span className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </span>
                  </div>
                )}
                
                {item.duration && (
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1 text-gray-400" />
                    <span className="text-gray-500">{item.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningRoadmapSection;
