import React from "react";
import { motion } from "framer-motion";
import { BarChart2, FileText, Star, TrendingUp, BookOpen, Briefcase, Award, Settings } from "react-feather"; 
import UserProfile from "./components/profile/UserProfile";
import ArchetypeCard from "./components/ArchetypeCard";
import AnalysisSection from './components/AnalysisSection';
import ResumeOptimizationSection from './components/ResumeOptimizationSection';
import StarInterviewSection from './components/StarInterviewSection';
import LearningRoadmapSection from './components/LearningRoadmapSection';
import FutureGrowthSection from './components/FutureGrowthSection';
import CareerDevelopmentSection from './components/CareerDevelopmentSection';
import DashboardCard from './components/common/DashboardCard';
import RecommendedRoles from './components/roles/RecommendedRoles';
import { CvAnalysis, ArchetypeData, SimpleArchetype, ComplexArchetype } from "../../types/analysis";
import { useDashboardData } from './hooks';

/**
 * The main dashboard page component.
 * Displays personalized career insights based on the user's CV analysis results.
 * Handles loading and error states based on the analysis result passed via route state.
 * 
 * Following the [FeatureFrontend] and [ComponentSplitting] rules from the project guidelines.
 */
const DashboardPage: React.FC = () => {
  const { analysisResult, loading, error } = useDashboardData();

  console.log('Dashboard data:', analysisResult);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin mb-4 mx-auto">
            <BarChart2 size={36} className="text-blue-500" />
          </div>
          <p className="text-gray-600">Loading your career insights...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          className="text-center max-w-md p-6 bg-white rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-amber-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Return to Home
          </a>
        </motion.div>
      </div>
    );
  }

  const isSimpleArchetype = (archetype: ArchetypeData | undefined): archetype is SimpleArchetype => {
    return Boolean(
      archetype && 
      'archetype' in archetype && 
      'short_description' in archetype &&
      'reasoning' in archetype
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
            Your Career Dashboard
          </h1>
          <motion.p 
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Personalized insights and recommendations based on your CV analysis
          </motion.p>
        </motion.div>

        {/* User Profile Section */}
        <UserProfile 
          userProfile={analysisResult?.user_profile} 
          profileStrengths={analysisResult?.profile_strengths}
          recruiterSummary={analysisResult?.recruiter_friendly_summary}
        />

        {/* Career Archetype Section */}
        {analysisResult?.archetype ? (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 rounded-t-xl border-b border-teal-700">
              <div className="flex items-center mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3">
                  <BarChart2 className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold text-white">Your CareerSense Archetype</h2>
              </div>
              <p className="text-white/90 text-base ml-1">
                Discover your professional identity and leverage your natural strengths. Your archetype, developed based on scientific research, reveals your unique approach to work and career development.
              </p>
            </div>
            <ArchetypeCard 
              data={{
                primary: {
                  archetype: isSimpleArchetype(analysisResult.archetype) ? analysisResult.archetype.archetype : "Analytical Thinker",
                  confidence: "High",
                  description: isSimpleArchetype(analysisResult.archetype) ? analysisResult.archetype.short_description : "",
                  strengths: ["Data analysis", "Critical thinking", "Problem-solving", "Attention to detail"],
                  challenges: ["May focus too much on details and miss the big picture", "Can overthink problems leading to analysis paralysis"],
                  careerPaths: ["Data Scientist", "Business Analyst", "Research Scientist", "Financial Analyst"],
                  developmentAreas: ["Strategic thinking workshops", "Big picture focus training"]
                },
                explanation: isSimpleArchetype(analysisResult.archetype) ? analysisResult.archetype.reasoning : "This archetype is evident from the strong analytical skills, problem-solving approach, and attention to detail demonstrated throughout the resume."
              }}
              userName={analysisResult?.user_profile?.name}
            />
          </motion.div>
        ) : (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              Career archetype data is not available. This may be due to an issue with the analysis.
            </p>
          </div>
        )}

        {/* Recommended Career Paths Section */}
        {analysisResult?.role_matching && analysisResult.role_matching.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <RecommendedRoles roleMatching={analysisResult.role_matching} showHeader={true} />
          </motion.div>
        )}

        {/* Two-column layout for better information density */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Analysis Section */}
            {analysisResult?.analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <DashboardCard 
                  title="Profile Analysis" 
                  icon={<FileText size={20} />}
                  colorTheme="blue"
                  explanation="A detailed analysis of your CV, highlighting strengths and areas for improvement."
                >
                  <AnalysisSection analysis={analysisResult.analysis} />
                </DashboardCard>
              </motion.div>
            )}

            {/* STAR Interview Stories */}
            {analysisResult?.star_interview_stories && analysisResult.star_interview_stories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <DashboardCard 
                  title="STAR Interview Stories" 
                  icon={<Award size={20} />}
                  colorTheme="amber"
                  explanation="We’ve turned your CV into powerful interview stories—ready to help you answer with confidence and make a lasting impression."
                >
                  <StarInterviewSection starStories={analysisResult.star_interview_stories} />
                </DashboardCard>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Resume Optimization */}
            {analysisResult?.resume_optimization && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DashboardCard 
                  title="Resume Optimization" 
                  icon={<Star size={20} />}
                  colorTheme="green"
                  explanation="Get actionable tips to improve your resume and increase your chances of getting noticed by hiring managers."
                >
                  <ResumeOptimizationSection resumeOptimization={analysisResult.resume_optimization} />
                </DashboardCard>
              </motion.div>
            )}

            {/* Career Development Insights */}
            {analysisResult?.career_development_insights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <DashboardCard 
                  title="Career Development Insights" 
                  icon={<Settings size={20} />}
                  colorTheme="indigo"
                  explanation="Discover opportunities for growth and development in your current role and beyond."
                >
                  <CareerDevelopmentSection careerInsights={analysisResult.career_development_insights} />
                </DashboardCard>
              </motion.div>
            )}
          </div>
        </div>

        {/* Full-width sections */}
        <div className="space-y-8">
          {/* Personalized Learning Roadmap */}
          {analysisResult?.personalized_learning_roadmap && analysisResult.personalized_learning_roadmap.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <DashboardCard 
                title="Personalized Learning Roadmap" 
                icon={<BookOpen size={20} />}
                colorTheme="pink"
                explanation="A tailored learning plan to help you acquire the skills and knowledge needed for your desired career path."
              >
                <LearningRoadmapSection learningRoadmap={analysisResult.personalized_learning_roadmap} />
              </DashboardCard>
            </motion.div>
          )}

          {/* Future Growth Potential */}
          {(analysisResult?.future_growth_potential) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <DashboardCard 
                title="Future Growth & Opportunities" 
                icon={<TrendingUp size={20} />}
                colorTheme="purple"
                explanation="Explore potential career paths and opportunities for growth and advancement."
              >
                <FutureGrowthSection 
                  futureGrowth={analysisResult.future_growth_potential} 
                />
              </DashboardCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
