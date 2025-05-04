import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { cn } from "../../../../lib/utils";

interface RoleCardProps {
  title: string;
  matchPercentage: number;
  transitionDifficulty: string;
  description?: string;
  requiredSkills: string[];
  skillGaps?: string[];
  delay?: number;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  matchPercentage,
  transitionDifficulty,
  description,
  requiredSkills,
  skillGaps = [],
  delay = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Standardized difficulty color mapping - updating Moderate to use yellow/amber colors
  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-100 text-green-700",
    Moderate: "bg-yellow-100 text-yellow-700", // Changed to yellow for better visibility
    Challenging: "bg-red-100 text-red-700",
    Hard: "bg-red-100 text-red-700",
    easy: "bg-green-100 text-green-700",
    moderate: "bg-yellow-100 text-yellow-700", // Changed to yellow for better visibility
    challenging: "bg-red-100 text-red-700",
    hard: "bg-red-100 text-red-700"
  };

  // Get appropriate match color based on percentage
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <motion.div
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
        {/* Header with role title and badges */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" />
            <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          </div>
          
          {/* Badges in their own row for better spacing */}
          <div className="flex flex-wrap gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              matchPercentage >= 90 ? "bg-green-100 text-green-800" :
              matchPercentage >= 70 ? "bg-blue-100 text-blue-800" :
              matchPercentage >= 50 ? "bg-amber-100 text-amber-800" :
              "bg-red-100 text-red-800"
            }`}>
              {matchPercentage}% Match
            </span>
            <span className={cn(
              "inline-block px-2 py-1 text-xs font-medium rounded-full",
              difficultyColors[transitionDifficulty] || "bg-gray-100 text-gray-700"
            )}>
              {transitionDifficulty} Transition
            </span>
          </div>
        </div>

        {description && <p className="text-sm text-gray-600 mt-3">{description}</p>}

        <div className="w-full h-2 bg-gray-100 rounded-full mt-4">
          <motion.div
            className={cn("h-full rounded-full", getMatchColor(matchPercentage))}
            initial={{ width: "0%" }}
            animate={{ width: `${matchPercentage}%` }}
            transition={{ duration: 1, delay: 0.2 + delay }}
          />
        </div>
      </div>

      <div className="p-4 bg-white">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-blue-600 transition-colors"
          aria-expanded={isExpanded}
          aria-controls={`skills-${title.replace(/\s+/g, '-')}`}
        >
          <span>Skills & Requirements</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id={`skills-${title.replace(/\s+/g, '-')}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h4>
                  <ul className="space-y-1">
                    {requiredSkills.map((skill, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <ArrowRight className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {skillGaps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills to Develop</h4>
                    <ul className="space-y-1">
                      {skillGaps.map((skill, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <ArrowRight className="h-3 w-3 text-amber-500 mr-1 flex-shrink-0" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RoleCard;