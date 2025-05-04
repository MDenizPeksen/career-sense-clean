import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, TrendingUp } from 'lucide-react';

interface Strength {
  type: 'skill' | 'competency' | 'achievement';
  title: string;
  description?: string;
  score?: number;
}

interface ProfileStrengthsCardProps {
  skills: Strength[];
  competencies: Strength[];
  achievements: Strength[];
}

const ProfileStrengthsCard: React.FC<ProfileStrengthsCardProps> = ({
  skills,
  competencies,
  achievements,
}) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Strengths</h2>
      <p className="text-gray-600 mb-6">
        Your strongest professional attributes identified from your resume.
      </p>

      <div className="space-y-6">
        <StrengthSection 
          title="Key Skills" 
          icon={<Star className="h-5 w-5 text-amber-500" />} 
          items={skills} 
          color="amber"
        />
        
        <StrengthSection 
          title="Core Competencies" 
          icon={<Award className="h-5 w-5 text-blue-500" />} 
          items={competencies} 
          color="blue"
        />
        
        <StrengthSection 
          title="Notable Achievements" 
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} 
          items={achievements} 
          color="emerald"
        />
      </div>
    </motion.div>
  );
};

interface StrengthSectionProps {
  title: string;
  icon: React.ReactNode;
  items: Strength[];
  color: 'amber' | 'blue' | 'emerald';
}

const StrengthSection: React.FC<StrengthSectionProps> = ({ title, icon, items, color }) => {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-100',
    blue: 'bg-blue-50 border-blue-100',
    emerald: 'bg-emerald-50 border-emerald-100',
  };

  return (
    <div>
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="font-semibold text-gray-800 ml-2">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className={`rounded-lg p-3 border ${colorClasses[color]}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="font-medium text-gray-800">{item.title}</div>
            {item.description && (
              <div className="text-sm text-gray-600 mt-1">{item.description}</div>
            )}
            {item.score && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full bg-${color}-500`} 
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStrengthsCard;
