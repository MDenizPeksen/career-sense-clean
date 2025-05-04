// components/FeatureCard/CollapsibleCard.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "react-feather";

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ 
  title, 
  children, 
  defaultOpen = false,
  icon,
  accentColor = "#3b82f6" // blue-600 default
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden mb-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
      style={{
        borderLeft: `4px solid ${accentColor}`
      }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50/70 transition-colors relative overflow-hidden group"
        whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.7)" }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Background gradient on hover */}
        <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: `radial-gradient(circle at right, ${accentColor}10, transparent 70%)`,
            zIndex: 0
          }}
        />

        <div className="flex items-center relative z-10">
          {icon && (
            <div 
              className="mr-3 p-2 rounded-lg flex items-center justify-center" 
              style={{ 
                backgroundColor: `${accentColor}15`,
                color: accentColor 
              }}
            >
              {icon}
            </div>
          )}
          <span className="text-lg font-semibold text-gray-800">{title}</span>
        </div>
        
        <motion.div
          className="relative z-10 bg-gray-100 rounded-full p-1 flex items-center justify-center"
          initial={{ rotate: 0 }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown size={18} color={accentColor} />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.2 }
              }
            }}
            className="overflow-hidden"
          >
            <div 
              className="px-6 py-5 text-gray-700 leading-relaxed" 
              style={{ 
                borderTop: "1px solid rgba(0,0,0,0.05)",
                background: "linear-gradient(to bottom, rgba(249, 250, 251, 0.8) 0%, rgba(255, 255, 255, 1) 100%)"
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CollapsibleCard;