import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface BulletComparisonProps {
  original: string;
  optimized: string;
  index: number;
}

const BulletComparison: React.FC<BulletComparisonProps> = ({ original, optimized, index }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 last:mb-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
    >
      <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
        <div className="bg-red-50 px-4 py-2 border-b border-red-200">
          <h3 className="text-sm font-medium text-red-700">Original</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700">{original}</p>
        </div>
      </div>

      <div className="relative">
        <div className="hidden md:flex absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
            <ArrowRight size={16} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-4 py-2 border-b border-green-200">
            <h3 className="text-sm font-medium text-green-700">Optimized</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700">{optimized}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BulletComparison;
