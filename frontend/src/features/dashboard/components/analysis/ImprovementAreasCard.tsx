import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'react-feather';

interface ImprovementArea {
  skills_gap?: string[];
  experience_gaps?: string[];
  presentation_structure?: string;
}

interface ImprovementAreasCardProps {
  improvements: ImprovementArea;
  delay?: number;
}

const ImprovementAreasCard: React.FC<ImprovementAreasCardProps> = ({ 
  improvements,
  delay = 0.4
}) => {
  if (!improvements) {
    return null;
  }

  const hasSkillsGap = improvements.skills_gap && improvements.skills_gap.length > 0;
  const hasExperienceGaps = improvements.experience_gaps && improvements.experience_gaps.length > 0;
  const hasPresentation = improvements.presentation_structure && improvements.presentation_structure.trim() !== '';

  if (!hasSkillsGap && !hasExperienceGaps && !hasPresentation) {
    return null;
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-md border border-yellow-100 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center mb-6">
          <AlertTriangle className="text-yellow-600 mr-3" size={22} />
          <h2 className="text-xl font-bold text-gray-800">Areas for Improvement</h2>
        </div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {/* Skills Gap */}
          {hasSkillsGap && (
            <motion.div variants={item}>
              <h3 className="text-md font-semibold text-gray-700 mb-3">Skills to Develop</h3>
              <div className="space-y-2">
                {improvements.skills_gap!.map((skill, idx) => (
                  <motion.div 
                    key={idx}
                    className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.05) }}
                  >
                    <p className="text-sm">{skill}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Experience Gaps */}
          {hasExperienceGaps && (
            <motion.div variants={item}>
              <h3 className="text-md font-semibold text-gray-700 mb-3">Experience Gaps</h3>
              <ul className="list-disc pl-5 space-y-2">
                {improvements.experience_gaps!.map((gap, idx) => (
                  <motion.li 
                    key={idx}
                    className="text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.05) }}
                  >
                    <p className="text-sm">{gap}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
          
          {/* Presentation Structure */}
          {hasPresentation && (
            <motion.div variants={item}>
              <h3 className="text-md font-semibold text-gray-700 mb-3">Presentation Structure</h3>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <p className="text-gray-700 text-sm">{improvements.presentation_structure}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ImprovementAreasCard; 