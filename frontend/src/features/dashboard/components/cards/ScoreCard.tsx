import React from 'react';
import { motion } from "framer-motion";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  description: string;
  variant?: "primary" | "secondary";
  className?: string;
  icon?: React.ReactNode;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  maxScore = 100,
  description,
  variant = "primary",
  className = "",
  icon,
}) => {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variants = {
    primary: {
      ringColor: "stroke-purple-500",
      textColor: "text-purple-700",
      bgGradient: "from-purple-50 to-blue-50",
    },
    secondary: {
      ringColor: "stroke-emerald-500",
      textColor: "text-emerald-700",
      bgGradient: "from-emerald-50 to-teal-50",
    },
  };

  const currentVariant = variants[variant];

  return (
    <motion.div
      className={`rounded-xl shadow-sm bg-white p-6 border border-gray-100 hover:shadow-md transition-shadow ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        {icon && <div className="mr-3">{icon}</div>}
        <h2 className={`text-xl font-bold ${currentVariant.textColor}`}>{title}</h2>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e6e6e6" strokeWidth="8" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              className={currentVariant.ringColor}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <span className={`text-3xl font-bold ${currentVariant.textColor}`}>{score}</span>
          </motion.div>
        </div>

        <div className="text-center">
          <div className={`text-sm font-medium mb-1 ${currentVariant.textColor}`}>
            {score >= 80 ? "Excellent" : score >= 70 ? "Good" : score >= 60 ? "Fair" : "Needs Work"}
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreCard;