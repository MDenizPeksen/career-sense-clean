import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award } from 'lucide-react';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'Course' | 'Article' | 'Video' | 'Book';
  url: string;
}

interface LearningPathCardProps {
  resources: LearningResource[];
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ resources }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Personalized Learning Path</h2>
      <p className="text-gray-600 mb-6">
        Resources tailored to help you develop skills for your career growth.
      </p>
      
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-3">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {resource.type}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{resource.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {resource.duration}
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {resource.level}
              </div>
            </div>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
            >
              Start Learning
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LearningPathCard;