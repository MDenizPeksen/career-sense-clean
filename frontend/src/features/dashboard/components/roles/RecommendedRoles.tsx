import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Briefcase, Info } from "react-feather";
import { CvAnalysis } from "../../../../types";

interface RecommendedRolesProps {
  roleMatching?: CvAnalysis['role_matching'];
  showHeader?: boolean;
}

interface RoleType {
  role: string;
  match_percentage: number;
  transition_difficulty: string;
  role_description?: string;
  required_skills: string[];
  salary_range?: string;
}

/**
 * Displays recommended career paths based on CV analysis.
 * Includes match percentages, transition difficulty, and required skills.
 * 
 * Following the [ComponentSplitting] and [ResponsiveFirst] rules.
 */
const RecommendedRoles: React.FC<RecommendedRolesProps> = ({ 
  roleMatching = [], 
  showHeader = true 
}) => {
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [displayRoles, setDisplayRoles] = useState<RoleType[]>([]);

  useEffect(() => {
    // Check if roleMatching exists and is valid
    if (Array.isArray(roleMatching) && roleMatching.length > 0 && 
        roleMatching[0].role && typeof roleMatching[0].match_percentage === 'number') {
      // Use roles from the backend (up to 3)
      setDisplayRoles(roleMatching.slice(0, 3));
    } else {
      // If no valid backend data, set empty array
      setDisplayRoles([]);
    }
  }, [roleMatching]);

  const toggleRole = (index: number) => {
    setExpandedRole(expandedRole === index ? null : index);
  };

  const getDifficultyColor = (difficulty: string): string => {
    const difficultyLower = difficulty?.toLowerCase() || '';
    if (difficultyLower.includes('easy')) {
      return 'bg-green-100 text-green-700';
    } else if (difficultyLower.includes('moderate')) {
      return 'bg-yellow-100 text-yellow-700';
    } else if (difficultyLower.includes('challenging') || difficultyLower.includes('hard')) {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  const getRoleColor = (index: number): {circle: string, bar: string} => {
    const colors = [
      {circle: 'bg-green-500', bar: 'from-green-500 to-transparent'},
      {circle: 'bg-blue-500', bar: 'from-blue-500 to-transparent'},
      {circle: 'bg-orange-500', bar: 'from-orange-500 to-transparent'}
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {showHeader && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 border-b border-indigo-700 rounded-t-xl">
          <div className="flex items-center mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3">
              <Briefcase className="text-white" size={22} />
            </div>
            <h2 className="text-2xl font-bold text-white">Recommended Career Paths</h2>
          </div>
          <p className="text-white/90 text-base ml-1">
            We've identified career opportunities tailored to your profile, along with the key skills needed to make a successful transition. Use these insights to plan your next move with confidence.
          </p>
        </div>
      )}
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayRoles.map((role: RoleType, index: number) => {
            const roleColor = getRoleColor(index);
            
            return (
              <div key={index} className="bg-white shadow-sm rounded-md overflow-hidden">
                {/* Colored top bar */}
                <div className={`h-2 w-full bg-gradient-to-r ${roleColor.bar}`}></div>
                
                <div className="p-5">
                  {/* Role title */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{role.role}</h3>
                  
                  {/* Role description */}
                  <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                    {role.role_description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    {/* Match percentage */}
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${roleColor.circle}`}>
                        {role.match_percentage}%
                      </div>
                      <div className="ml-2">
                        <div className="text-xs text-gray-500">Match</div>
                        <div className="text-xs font-medium">
                          {role.match_percentage >= 80 ? 'Excellent Match' : 
                          role.match_percentage >= 70 ? 'Good Match' : 'Moderate Match'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Difficulty badge */}
                    <div className={`text-xs rounded-full px-3 py-0.5 font-medium ${getDifficultyColor(role.transition_difficulty)}`}>
                      {role.transition_difficulty}
                    </div>
                  </div>
                  
                  {/* Salary */}
                  <div className="text-sm text-gray-600 mb-4">
                    $ {role.salary_range}
                  </div>
                  
                  {/* Required Skills dropdown */}
                  <div className="border-t border-gray-100 pt-2">
                    <button 
                      onClick={() => toggleRole(index)}
                      className="w-full flex justify-between items-center py-2 text-sm text-blue-600 hover:text-blue-800"
                      aria-expanded={expandedRole === index}
                      aria-controls={`skills-panel-${index}`}
                    >
                      <span>Required Skills</span>
                      <ChevronDown 
                        className={`transform transition-transform ${expandedRole === index ? 'rotate-180' : ''}`} 
                        size={16} 
                      />
                    </button>
                    
                    {expandedRole === index && (
                      <motion.div
                        id={`skills-panel-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ul className="space-y-1 py-2 text-sm text-gray-600">
                          {role.required_skills && role.required_skills.map((skill: string, skillIndex: number) => (
                            <li key={skillIndex} className="flex items-center">
                              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></span>
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pro tip */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
          <div className="text-blue-500 mr-2 mt-0.5">
            <Info size={16} />
          </div>
          <div>
            <span className="text-sm font-medium text-blue-700">Pro Tip:</span> <span className="text-sm text-blue-600">Focus on developing the required skills for your target role. Consider taking online courses or certifications to bridge any skill gaps and increase your match percentage.</span>
          </div>
        </div>
        
        {/* Upcoming feature */}
        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-start">
          <div className="text-purple-500 mr-2 mt-0.5">
            <Briefcase size={16} />
          </div>
          <div>
            <span className="text-sm font-medium text-purple-700">Upcoming feature:</span> <span className="text-sm text-purple-600">Soon we'll be providing current open roles from different recruiting platforms tailored to your profile and skills. Stay tuned!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedRoles;
