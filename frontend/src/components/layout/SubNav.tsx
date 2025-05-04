import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, FileText, Video } from 'react-feather';

interface SubNavProps {
  currentPath?: string;
}

const SubNav: React.FC<SubNavProps> = ({ currentPath }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex justify-center flex-wrap gap-4 mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <button 
        className={`flex items-center px-6 py-3 rounded-full font-semibold border-2 transition-all duration-300 
          ${currentPath === '/' 
            ? 'bg-[#1a1a3d] text-white border-[#1a1a3d]' 
            : 'bg-white text-[#1a1a3d] border-[#1a1a3d] hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]'}`}
        onClick={() => navigate("/")}
      >
        <Home size={16} className="mr-2" /> Home
      </button>
      <button 
        className={`flex items-center px-6 py-3 rounded-full font-semibold border-2 transition-all duration-300 
          ${currentPath === '/career-paths' 
            ? 'bg-[#1a1a3d] text-white border-[#1a1a3d]' 
            : 'bg-white text-[#1a1a3d] border-[#1a1a3d] hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]'}`}
        onClick={() => navigate("/career-paths")}
      >
        <BookOpen size={16} className="mr-2" /> Career Paths
      </button>
      <button 
        className={`flex items-center px-6 py-3 rounded-full font-semibold border-2 transition-all duration-300 
          ${currentPath === '/cv-upload' 
            ? 'bg-[#1a1a3d] text-white border-[#1a1a3d]' 
            : 'bg-white text-[#1a1a3d] border-[#1a1a3d] hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]'}`}
        onClick={() => navigate("/cv-upload")}
      >
        <FileText size={16} className="mr-2" /> Upload CV
      </button>
      <button 
        className={`flex items-center px-6 py-3 rounded-full font-semibold border-2 transition-all duration-300 
          ${currentPath === '/mock-interviews' 
            ? 'bg-[#1a1a3d] text-white border-[#1a1a3d]' 
            : 'bg-white text-[#1a1a3d] border-[#1a1a3d] hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00]'}`}
        onClick={() => navigate("/mock-interviews")}
      >
        <Video size={16} className="mr-2" /> Mock Interviews
      </button>
    </motion.div>
  );
};

export default SubNav;
