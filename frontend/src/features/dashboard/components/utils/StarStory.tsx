import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../../lib/utils";

interface StarStoryProps {
  index: number;
  situation: string;
  task: string;
  action: string;
  result: string;
}

const StarStory: React.FC<StarStoryProps> = ({ 
  index, 
  situation, 
  task, 
  action, 
  result 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full p-4 text-left transition-colors",
          isOpen ? "bg-purple-50" : "bg-white hover:bg-gray-50",
        )}
        aria-expanded={isOpen}
        aria-controls={`star-story-${index}`}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-purple-700">{index+1}</span>
          </div>
          <span className="font-medium text-gray-800">STAR Story #{index+1}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={18} className="text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`star-story-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-purple-700 mb-1">Situation</h4>
                <p className="text-gray-700">{situation}</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-1">Task</h4>
                <p className="text-gray-700">{task}</p>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-700 mb-1">Action</h4>
                <p className="text-gray-700">{action}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 mb-1">Result</h4>
                <p className="text-gray-700">{result}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarStory;
