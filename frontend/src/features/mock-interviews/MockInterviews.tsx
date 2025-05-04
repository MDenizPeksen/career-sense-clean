import React from 'react';
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import SubNav from "../../components/layout/SubNav";
import { Briefcase, MessageCircle, Award, Mic } from "react-feather";

// Define animation variants at the module level, not inside the component
const floatingIconVariants = {
  animate: (custom: number) => ({
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
      delay: custom * 0.2
    }
  })
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface FeatureCard {
  title: string;
  text: string;
}

const MockInterviews: React.FC = () => {
  const location = useLocation();

  const featureCards: FeatureCard[] = [
    {
      title: "🤖 Personalized Interview Simulations",
      text: "Practice role-specific questions tailored to your background using AI-generated scenarios.",
    },
    {
      title: "🌟 STAR Story Builder",
      text: "Get structured stories auto-generated from your experiences to answer behavioral questions like a pro.",
    },
    {
      title: "🎙️ Tough Question Prep",
      text: "We help you prepare answers for challenging questions such as 'What's your biggest weakness?' or 'Tell me about a failure.'",
    },
    {
      title: "📊 Real-time Feedback (Coming Soon)",
      text: "Soon, you'll receive real-time feedback and improvement suggestions on your responses using speech analysis.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto my-8 px-6 relative overflow-hidden">
      {/* Decorative floating elements */}
      <motion.div 
        className="absolute top-20 left-20 text-indigo-500 opacity-20 hidden md:block"
        variants={floatingIconVariants}
        animate="animate"
        custom={0}
      >
        <Briefcase size={40} />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-32 right-32 text-purple-500 opacity-20 hidden md:block"
        variants={floatingIconVariants}
        animate="animate"
        custom={1}
      >
        <MessageCircle size={50} />
      </motion.div>
      
      <motion.div 
        className="absolute top-40 right-40 text-blue-500 opacity-20 hidden md:block"
        variants={floatingIconVariants}
        animate="animate"
        custom={2}
      >
        <Award size={35} />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-40 left-40 text-green-500 opacity-20 hidden md:block"
        variants={floatingIconVariants}
        animate="animate"
        custom={3}
      >
        <Mic size={45} />
      </motion.div>

      {/* Subtle background glow */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"
        variants={pulseVariants}
        animate="animate"
        style={{ zIndex: -1 }}
      />
      
      {/* Sub Navigation */}
      <SubNav currentPath={location.pathname} />
      
      <div className="pt-5 relative z-10">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-4xl font-bold text-[#1a1a3d] mb-4 relative inline-block mx-auto w-full"
          >
            Mock Interviews with AI Precision
            <motion.span 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: "48px" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            We analyze your CV and work history using AI to prepare you for interviews in your target roles. From generating STAR stories to tackling the toughest questions, CareerSense helps you shine with confidence.
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-b from-white to-indigo-50/30 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-indigo-100/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ 
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)",
                borderColor: "rgba(99, 102, 241, 0.3)"
              }}
            >
              <h3 className="text-lg font-bold text-[#1a1a3d] mb-3">{card.title}</h3>
              <p className="text-base text-gray-600 leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Animated background elements */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.2),transparent_30%)]" 
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.div 
            className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white opacity-10"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <motion.div 
            className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white opacity-10"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative z-10">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Coming Soon!
            </motion.h2>
            <motion.p 
              className="text-base max-w-xl mx-auto leading-relaxed font-medium text-white/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              We're working hard to bring you the full mock interview experience.
              Check back soon for interactive practice sessions with our AI interviewer.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MockInterviews;