import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink } from "lucide-react";

interface LearningCardProps {
  course: string;
  platform: string;
  impact: string;
  index: number;
}

const LearningCard: React.FC<LearningCardProps> = ({ course, platform, impact, index }) => {
  return (
    <motion.div
      className="bg-white border border-blue-100 rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-blue-100">
        <div className="flex items-center">
          <BookOpen size={16} className="text-blue-600 mr-2" />
          <h3 className="font-medium text-gray-800">{course}</h3>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{platform}</span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Recommended</span>
        </div>
        
        <p className="text-sm text-gray-700 mb-3">{impact}</p>
        
        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
          <span>Learn More</span>
          <ExternalLink size={14} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

export default LearningCard;
