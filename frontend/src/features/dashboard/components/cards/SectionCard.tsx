import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  delay?: number;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  icon: IconComponent, 
  children, 
  className = "",
  delay = 0
}) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center mb-6">
        {IconComponent && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center mr-3">
            <IconComponent size={20} className="text-purple-600" />
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      
      {children}
    </motion.div>
  );
};

export default SectionCard;
