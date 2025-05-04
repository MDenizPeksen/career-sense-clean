import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { ArrowRight } from 'react-feather';
import SubNav from '../../components/layout/SubNav';

// Define interfaces for our data types
interface WorkforceInsight {
  icon: string;
  stat: string;
  source: string;
}

interface JobRole {
  title: string;
  growth: number;
  category: 'growing' | 'steady' | 'declining';
}

interface FeatureItem {
  title: string;
  description: string;
}

interface DataSource {
  title: string;
  description: string;
  color: string;
}

const CareerPaths: React.FC = () => {
  const location = useLocation();

  // Workforce Insight data
  const workforceInsights: WorkforceInsight[] = [
    {
      icon: "🔄",
      stat: "Over 50% of workers changed careers since 2020",
      source: "LinkedIn Learning Report, 2023"
    },
    {
      icon: "🤖",
      stat: "AI expected to impact 44% of jobs by 2027",
      source: "World Economic Forum, 2023"
    },
    {
      icon: "🏠",
      stat: "85% of workers prefer remote or hybrid roles",
      source: "McKinsey, 2022"
    },
    {
      icon: "📚",
      stat: "Skill lifespan is now under 3 years",
      source: "IBM, 2023"
    },
    {
      icon: "💬",
      stat: "Prompt Engineer listings grew 5x last year",
      source: "LinkedIn Jobs Report, 2024"
    }
  ];

  // Job roles data
  const jobRolesData = {
    fastestGrowing: [
      { title: "AI & Machine Learning Specialist", growth: 39, category: 'growing' as const },
      { title: "Sustainability Specialist", growth: 33, category: 'growing' as const },
      { title: "Business Intelligence Analyst", growth: 32, category: 'growing' as const },
      { title: "Information Security Analyst", growth: 31, category: 'growing' as const },
      { title: "Fintech Engineer", growth: 31, category: 'growing' as const },
    ],
    steadyGrowth: [
      { title: "Software Developer / Engineer", growth: 25, category: 'steady' as const },
      { title: "Management / Business Analyst", growth: 11, category: 'steady' as const },
      { title: "Project Manager", growth: 7, category: 'steady' as const }
    ],
    fastestDeclining: [
      { title: "Cashier & Ticket Clerk", growth: -31, category: 'declining' as const },
      { title: "Data Entry Clerk", growth: -35, category: 'declining' as const },
      { title: "Bank Teller & Related Clerks", growth: -40, category: 'declining' as const },
    ]
  };

  // Combine all roles into a single array
  const allRoles = [
    ...jobRolesData.fastestGrowing,
    ...jobRolesData.steadyGrowth,
    ...jobRolesData.fastestDeclining
  ];

  // Data sources
  const dataSources: DataSource[] = [
    {
      title: "Top 5 Fastest-Growing Roles",
      description: "World Economic Forum's Future of Jobs Report (2023)",
      color: "bg-emerald-500"
    },
    {
      title: "Steady Growth Roles",
      description: "U.S. Bureau of Labor Statistics - Occupational Outlook Handbook (2022-2032)",
      color: "bg-amber-500"
    },
    {
      title: "Fastest-Declining Roles",
      description: "World Economic Forum's Future of Jobs Report (2023)",
      color: "bg-red-500"
    }
  ];

  // Future features data
  const futureFeatures: FeatureItem[] = [
    {
      title: "Role Fit Scoring",
      description: "See how your skills and experience align with specific job requirements"
    },
    {
      title: "Skill Gap Detection",
      description: "Identify missing skills needed for your target roles"
    },
    {
      title: "Personalized Learning Paths",
      description: "Custom learning recommendations to build your career"
    },
    {
      title: "Application Strategy Assistant",
      description: "Get guidance on when and how to apply for maximum success"
    }
  ];

  // Chart ref for scroll-based animations
  const chartRef = useRef(null);

  // Function to get bar color based on category
  const getBarColor = (category: string) => {
    switch (category) {
      case 'growing':
        return 'bg-emerald-500';
      case 'steady':
        return 'bg-amber-500';
      case 'declining':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-6">
      <SubNav currentPath={location.pathname} />
      <div className="pt-5">
        {/* 1. Hero Section */}
        <motion.section 
          className="relative py-8 mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Background pattern - using gradient instead of pattern */}
          <div className="absolute inset-0 opacity-5 -z-10 bg-gradient-to-r from-indigo-50 to-purple-50"></div>
          
          <h1 className="mb-6 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-700">
            Navigate Your Career with Confidence
          </h1>
          <p className="mx-auto text-lg leading-relaxed text-gray-600 max-w-3xl">
            CareerSense isn't just about refining your CV — it's about guiding you through a changing world of work, 
            helping you uncover your strengths, explore high-growth roles, and build a career path with clarity and confidence.
          </p>
        </motion.section>

        {/* 2. Workforce Insight Feed */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-3 text-2xl font-bold text-center text-indigo-900">Workforce Insights</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {workforceInsights.map((insight: WorkforceInsight, index: number) => (
              <motion.div 
                key={index} 
                className="p-6 transition-all duration-300 bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 border border-indigo-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-2xl bg-white rounded-full shadow-sm border border-indigo-100">{insight.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-indigo-900 text-center">{insight.stat}</h3>
                <p className="text-sm text-gray-500 text-center">{insight.source}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 3. Job Roles Chart */}
        <motion.section 
          ref={chartRef}
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">The Roles Defining the Future of Work</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              CareerSense continuously analyzes global labor-market data to help you align your strengths 
              with high-growth opportunities and build resilience against roles at risk of automation.
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">The Evolving Job Landscape</h3>
            
            <div className="p-6 bg-white rounded-xl shadow-sm">
              {/* Chart legend */}
              <div className="flex flex-wrap gap-4 mb-6 justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm">Top 5 Fastest-Growing Job Roles (2023-2027)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  <span className="text-sm">Steady Growth in Well-Known Roles</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Fastest-Declining Job Roles</span>
                </div>
              </div>
              
              {/* Bar chart container */}
              <div className="relative">
                {/* Continuous vertical dashed line at 0% */}
                <div className="absolute top-0 bottom-0 w-0 border-l border-dashed border-gray-500 z-10 h-full" style={{ left: 'calc(48px + 56px + 16px + 50%)' }}></div>
                
                {/* Bars and labels */}
                <div className="mb-2">
                  {allRoles.map((role: JobRole, index: number) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center mb-4 last:mb-0"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <div className="w-48 mr-4 text-sm font-medium text-indigo-900 md:w-56">{role.title}</div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-full relative">
                        {role.growth >= 0 ? (
                          <motion.div 
                            className={`h-full rounded-r-full absolute left-1/2 ${getBarColor(role.category)}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(50, (role.growth / 40) * 50)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                          >
                            <span className="flex items-center justify-end h-full pr-2 text-xs font-bold text-white">
                              +{role.growth}%
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div 
                            className={`h-full rounded-l-full absolute right-1/2 ${getBarColor(role.category)}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(50, (Math.abs(role.growth) / 40) * 50)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                          >
                            <span className="flex items-center justify-start h-full pl-2 text-xs font-bold text-white">
                              {role.growth}%
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Percentage axis below the bars */}
                <div className="flex mt-2 pl-[calc(3rem+12rem)]">
                  <div className="flex-1 relative h-6">
                    {/* Axis line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gray-300"></div>
                    
                    {/* Tick marks and labels */}
                    <div className="absolute -top-1 left-0 h-2 w-px bg-gray-300"></div>
                    <div className="absolute -top-1 left-1/4 h-2 w-px bg-gray-300"></div>
                    <div className="absolute -top-1 left-1/2 h-2 w-px bg-gray-500"></div>
                    <div className="absolute -top-1 left-3/4 h-2 w-px bg-gray-300"></div>
                    <div className="absolute -top-1 right-0 h-2 w-px bg-gray-300"></div>
                    
                    <div className="absolute top-2 left-0 text-xs text-gray-500 transform -translate-x-1/2">-40%</div>
                    <div className="absolute top-2 left-1/4 text-xs text-gray-500 transform -translate-x-1/2">-20%</div>
                    <div className="absolute top-2 left-1/2 text-xs font-medium text-gray-700 transform -translate-x-1/2">0%</div>
                    <div className="absolute top-2 left-3/4 text-xs text-gray-500 transform -translate-x-1/2">+20%</div>
                    <div className="absolute top-2 right-0 text-xs text-gray-500 transform translate-x-1/2">+40%</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data sources */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {dataSources.map((source, index) => (
                <motion.div 
                  key={index} 
                  className={`p-4 rounded-lg ${source.color} bg-opacity-10 border border-transparent hover:border-${source.color.replace('bg-', '')}-300 transition-all duration-300`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${source.color} text-white mr-3`}>
                      {index === 0 ? "📈" : index === 1 ? "⚖️" : "📉"}
                    </div>
                    <h4 className="font-semibold text-indigo-900 text-lg">{source.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{source.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. Career Path Exploration */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">Find Your Optimal Career Path</h2>
          <div className="flex flex-col items-start gap-6 md:flex-row">
            <div className="w-full md:w-1/2">
              <p className="mb-4 text-lg font-medium leading-relaxed text-indigo-900">
                Our AI-powered career path explorer analyzes your skills, experience, and preferences to suggest personalized career trajectories.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 mt-0.5 mr-2 text-white bg-indigo-600 rounded-full">●</span>
                  <span className="text-gray-700">Discover roles that match your unique skill profile</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 mt-0.5 mr-2 text-white bg-indigo-600 rounded-full">●</span>
                  <span className="text-gray-700">See salary ranges and growth projections</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 mt-0.5 mr-2 text-white bg-indigo-600 rounded-full">●</span>
                  <span className="text-gray-700">Compare multiple career paths side-by-side</span>
                </li>
              </ul>
              <Link to="/cv-upload" className="inline-block">
                <button className="flex items-center px-6 py-3 mt-6 text-white transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:shadow-lg hover:-translate-y-1">
                  Upload Your CV
                  <ArrowRight className="ml-2" size={18} />
                </button>
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src="/img/svg/graphs.svg" 
                alt="Career Path Explorer" 
                className="w-full rounded-xl shadow-md"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Career+Path+Explorer';
                }}
              />
            </div>
          </div>
        </motion.section>

        {/* 5. Coming Soon Features */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">More Personalized Guidance</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {futureFeatures.map((feature: FeatureItem, index: number) => (
              <motion.div 
                key={index}
                className="p-6 transition-all duration-300 bg-white rounded-xl shadow-sm hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={`w-10 h-10 mb-4 rounded-full flex items-center justify-center ${
                  index === 0 ? "bg-blue-100 text-blue-600" :
                  index === 1 ? "bg-green-100 text-green-600" :
                  index === 2 ? "bg-purple-100 text-purple-600" :
                  "bg-orange-100 text-orange-600"
                }`}>
                  {index === 0 ? "📊" : index === 1 ? "🔍" : index === 2 ? "🎓" : "📝"}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-indigo-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default CareerPaths;