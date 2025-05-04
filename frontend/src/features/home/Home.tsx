import { motion } from 'framer-motion';
import FeatureCard from '../../components/common/FeatureCard/FeatureCard';
import { TrendingUp, Upload, Mic } from 'react-feather';

const Home: React.FC = () => {
  const features = [
    {
      icon: <TrendingUp size={32} />,
      title: "Explore Career Paths",
      description: "Discover roles tailored to your background and aspirations.",
      link: "/career-paths"
    },
    {
      icon: <Upload size={32} />,
      title: "Upload CV",
      description: "AI-powered analysis to improve your CV and profile.",
      link: "/cv-upload"
    },
    {
      icon: <Mic size={32} />,
      title: "Mock Interviews",
      description: "Practice with real questions and boost your confidence.",
      link: "/mock-interviews"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden bg-[#0a0f1e] text-white">
      <div className="text-center py-32 px-4 max-w-7xl mx-auto relative z-10">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-tight tracking-tight relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1,
            type: "spring",
            stiffness: 100 
          }}
        >
          Shape Your Future Career
          <span className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded"></span>
        </motion.h1>
        <motion.p
          className="text-2xl text-slate-400 max-w-xl mx-auto mt-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.2,
            ease: "easeOut"
          }}
        >
          Get personalized career guidance powered by AI
        </motion.p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto p-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            custom={index}
            className="transform-gpu hover:animate-float"
            style={{ 
              animationDelay: `${index * 2}s`,
            }}
          >
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(217,70,239,0.15),transparent_40%)] z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      <motion.div 
        className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] z-0 pointer-events-none opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2 }}
      />
    </div>
  );
};

export default Home;