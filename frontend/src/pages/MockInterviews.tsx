import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import SubNav from "../components/layout/SubNav";
import { Home, BookOpen, FileText, Video } from "react-feather";

interface FeatureCard {
  title: string;
  text: string;
}

const MockInterviews: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="max-w-7xl mx-auto my-8 px-6">
      {/* Sub Navigation */}
      <SubNav currentPath={location.pathname} />
      
      <div className="pt-5">
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
            className="text-center text-4xl font-bold text-[#1a1a3d] mb-4"
          >
            Mock Interviews with AI Precision
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
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <h3 className="text-lg font-bold text-[#1a1a3d] mb-3">{card.title}</h3>
              <p className="text-base text-gray-600 leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed">
            We're working hard to bring you the full mock interview experience.
            Check back soon for interactive practice sessions with our AI interviewer.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MockInterviews;