import React from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the DashboardCard component.
 */
interface DashboardCardProps {
  /** Title for the card */
  title: string;
  /** Icon to display in the header */
  icon: React.ReactNode;
  /** Optional subtitle for the card */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Optional color theme (default: 'blue') */
  colorTheme?: 'blue' | 'green' | 'purple' | 'amber' | 'indigo' | 'teal' | 'pink' | 'red';
  /** Optional delay for animation */
  animationDelay?: number;
  /** Optional gradient direction (default: 'to-r') */
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  /** Optional class for body section */
  bodyClassName?: string;
  /** Optional class for card container */
  className?: string;
  /** Optional explanation text to display below the title */
  explanation?: string;
}

/**
 * A standardized card component for the dashboard.
 * 
 * Follows the [AtomicDesign] and [ComponentSplitting] rules to provide
 * a reusable UI element with consistent styling across the dashboard.
 * Also adheres to [AccessibilityCore] with appropriate ARIA attributes.
 */
const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  subtitle,
  children,
  colorTheme = 'blue',
  animationDelay = 0.3,
  gradientDirection = 'to-r',
  bodyClassName = 'p-5',
  className = '',
  explanation
}) => {
  // Color theme configuration with enhanced multi-color gradients
  const themeColors = {
    blue: {
      header: `from-blue-600 via-blue-500 to-indigo-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-blue-700'
    },
    green: {
      header: `from-emerald-600 via-green-500 to-teal-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-emerald-700'
    },
    purple: {
      header: `from-purple-600 via-violet-600 to-indigo-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-purple-700'
    },
    amber: {
      header: `from-amber-500 via-orange-500 to-amber-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-amber-700'
    },
    indigo: {
      header: `from-indigo-600 via-blue-600 to-purple-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-indigo-700'
    },
    teal: {
      header: `from-emerald-600 via-teal-500 to-cyan-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-teal-700'
    },
    pink: {
      header: `from-pink-600 via-rose-500 to-purple-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-pink-700'
    },
    red: {
      header: `from-red-600 via-rose-500 to-orange-600`,
      icon: 'bg-white/20 text-white',
      border: 'border-red-700'
    }
  };

  const selectedTheme = themeColors[colorTheme];
  const uniqueId = `card-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <motion.div
      className={`bg-white rounded-xl overflow-hidden shadow-sm w-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
    >
      {/* Card Header */}
      <div 
        className={`bg-gradient-${gradientDirection} ${selectedTheme.header} p-6 border-b ${selectedTheme.border} w-full`}
        aria-labelledby={uniqueId}
      >
        <div className="flex items-center mb-2">
          <div className={`${selectedTheme.icon} p-2 rounded-lg mr-3 backdrop-blur-sm`}>
            {icon}
          </div>
          <div>
            <h2 id={uniqueId} className="text-xl font-bold text-white">{title}</h2>
            {explanation && (
              <p className="text-white/90 text-sm ml-1">
                {explanation}
              </p>
            )}
            {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className={bodyClassName}>
        {children}
      </div>
    </motion.div>
  );
};

export default DashboardCard;
