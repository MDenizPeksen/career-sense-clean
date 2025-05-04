import React from 'react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  return (
    <motion.div 
      className="dashboard-header mb-8 text-center sm:text-left"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-gray-600">{subtitle}</p>}
    </motion.div>
  );
};

export default DashboardHeader;
