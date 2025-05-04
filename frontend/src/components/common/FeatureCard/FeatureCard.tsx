import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, link }) => {
  return (
    <motion.div
      className="relative flex flex-col items-center min-h-[280px] p-8 overflow-hidden text-center transition-all duration-300 cursor-pointer rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.05] hover:shadow-[0_0_20px_rgba(99,102,241,0.1),_0_0_40px_rgba(139,92,246,0.1)] group md:p-12 lg:p-16 xl:p-20"
      whileHover={{ 
        y: -10,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
      
      {/* Border gradient effect */}
      <div className="absolute inset-0 p-0.5 rounded-3xl bg-gradient-to-br from-indigo-500/50 to-purple-500/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }}></div>
      
      <motion.div 
        className="relative flex items-center justify-center w-16 h-16 mb-6 text-2xl text-white rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden group-hover:from-indigo-600 group-hover:to-purple-600 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        {icon}
      </motion.div>
      
      <h3 className="mb-4 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 group-hover:from-white group-hover:to-gray-300 md:text-2xl lg:text-3xl xl:text-4xl">{title}</h3>
      
      <p className="mb-6 text-gray-300 group-hover:text-gray-200 flex-grow md:text-lg lg:text-xl xl:text-2xl">{description}</p>
      
      <motion.a
        href={link}
        className="inline-flex items-center px-6 py-2 font-medium text-white rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/10 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 group-hover:translate-x-1 md:px-8 md:py-3 lg:px-10 lg:py-4 xl:px-12 xl:py-5"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Learn More
        <span className="ml-2 text-lg transition-transform duration-300 group-hover:translate-x-1 md:text-xl lg:text-2xl xl:text-3xl">→</span>
      </motion.a>
    </motion.div>
  );
};

export default FeatureCard;