import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import RoleCard from './RoleCard';

interface RoleMatch {
  id?: string;
  title: string;
  role?: string; // Support both naming conventions
  matchPercentage: number;
  match_percentage?: number; // Support both naming conventions
  transitionDifficulty: string;
  transition_difficulty?: string; // Support both naming conventions
  description?: string;
  requiredSkills: string[];
  required_skills?: string[]; // Support both naming conventions
  skillGaps?: string[];
}

interface RoleMatchCardProps {
  roles: RoleMatch[];
  title?: string;
  description?: string;
}

const RoleMatchCard: React.FC<RoleMatchCardProps> = ({ 
  roles, 
  title = "Recommended Roles",
  description = "Career opportunities that match your experience and skills."
}) => {
  // Normalize role data to handle different property naming conventions
  const normalizedRoles = roles.map(role => ({
    title: role.title || role.role || "",
    matchPercentage: role.matchPercentage || role.match_percentage || 0,
    transitionDifficulty: role.transitionDifficulty || role.transition_difficulty || "Moderate",
    description: role.description || "",
    requiredSkills: role.requiredSkills || role.required_skills || [],
    skillGaps: role.skillGaps || []
  }));

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <Briefcase className="h-5 w-5 text-indigo-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        {description}
      </p>

      <div className="space-y-4">
        {normalizedRoles.map((role, index) => (
          <RoleCard
            key={index}
            title={role.title}
            matchPercentage={role.matchPercentage}
            transitionDifficulty={role.transitionDifficulty}
            description={role.description}
            requiredSkills={role.requiredSkills}
            skillGaps={role.skillGaps}
            delay={0.1 * index}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default RoleMatchCard;