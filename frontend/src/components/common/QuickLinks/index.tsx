import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
import { motion } from "framer-motion";
import { TrendingUp, Upload, Mic } from "react-feather";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 15
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const iconVariants = {
  idle: { y: 0 },
  hover: { 
    y: -3,
    transition: {
      duration: 0.2,
      yoyo: Infinity,
      ease: "easeInOut"
    }
  }
};

interface QuickLinkProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  index: number;
  onHover: (index: number | null) => void;
  activeIndex: number | null;
}

const QuickLink: React.FC<QuickLinkProps> = ({ 
  icon, 
  title, 
  description, 
  path, 
  index, 
  onHover, 
  activeIndex 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Simply navigate to the path - ProtectedRoute component will handle authentication if needed
    navigate(path);
  };

  return (
    <Col xs={24} sm={12} md={8}>
      <motion.div
        className="relative h-full p-3 text-center text-white transition-all duration-300 bg-white/10 backdrop-blur-lg rounded-2xl cursor-pointer border border-white/10 hover:bg-orange-500/30 hover:border-orange-400/50 hover:shadow-lg hover:-translate-y-1 group isolate overflow-hidden"
        variants={cardVariants}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.2 }
        }}
        onClick={handleClick}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Gradient overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-orange-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"></div>
        
        {/* Mouse position radial gradient effect */}
        <div className="absolute inset-0 bg-radial-gradient-orange opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none -z-10"></div>
        
        <motion.div 
          className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 text-white/90 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/40"
          variants={iconVariants}
          initial="idle"
          whileHover="hover"
        >
          {icon}
        </motion.div>
        <h3 className="m-0 mb-1 text-xl font-semibold text-white tracking-tight group-hover:text-white">{title}</h3>
        <p className="m-0 text-sm leading-relaxed text-white/70 group-hover:text-white/90 pb-1">{description}</p>
      </motion.div>
    </Col>
  );
};

const QuickLinks: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const links: Omit<QuickLinkProps, 'index' | 'onHover' | 'activeIndex'>[] = [
    {
      icon: <TrendingUp size={24} />,
      title: "Explore Career Paths",
      description: "Discover roles tailored to your background and aspirations.",
      path: "/career-paths"
    },
    {
      icon: <Upload size={24} />,
      title: "Upload CV",
      description: "AI-powered analysis to improve your CV and profile.",
      path: "/cv-upload"
    },
    {
      icon: <Mic size={24} />,
      title: "Mock Interviews",
      description: "Practice with real questions and boost your confidence.",
      path: "/mock-interviews"
    }
  ];

  // Function to determine background gradient based on active index
  const getBackgroundGradient = () => {
    if (activeIndex === null) {
      return "bg-gradient-to-br from-purple-900 to-indigo-900";
    } else if (activeIndex === 0) {
      return "bg-gradient-to-r from-rose-700 via-purple-900 to-indigo-900";
    } else if (activeIndex === 1) {
      return "bg-gradient-to-r from-indigo-900 via-rose-700 to-indigo-900";
    } else {
      return "bg-gradient-to-r from-indigo-900 via-purple-900 to-rose-700";
    }
  };

  return (
    <section 
      className={`py-4 px-4 mt-16 mb-16 mx-4 md:mx-auto rounded-3xl relative overflow-hidden max-w-6xl shadow-xl transition-all duration-500 ${getBackgroundGradient()}`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-radial-gradient-indigo opacity-20 pointer-events-none"></div>
      
      {/* Animated gradient overlay based on hover position */}
      {activeIndex !== null && (
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeIndex === 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/40 to-transparent"></div>
          )}
          {activeIndex === 1 && (
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-radial-gradient opacity-0"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
            </motion.div>
          )}
          {activeIndex === 2 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rose-500/40"></div>
          )}
        </motion.div>
      )}
      
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={[12, 12]} justify="center">
          {links.map((link, index) => (
            <QuickLink 
              key={link.path} 
              {...link} 
              index={index}
              onHover={setActiveIndex}
              activeIndex={activeIndex}
            />
          ))}
        </Row>
      </motion.div>
    </section>
  );
};

export default QuickLinks;