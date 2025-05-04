import CollapsibleCard from "./CollapsibleCard";
import { motion } from "framer-motion";
import { Award, AlertTriangle, Briefcase, Edit, BookOpen, MessageSquare, BarChart2 } from "react-feather";

interface CvAnalysis {
  profile_strengths?: {
    skills: string[];
    core_competencies: string[];
    achievements: string[];
  };
  improvement_areas?: {
    skills_gap: string[];
    experience_gaps: string[];
    presentation_structure: string;
  };
  role_matching?: {
    role: string;
    match_percentage: number;
    transition_difficulty: string;
    required_skills: string[];
  }[];
  resume_optimization?: {
    bullet_rewrites: {
      original: string;
      optimized: string;
    }[];
    ats_keywords_missing: string[];
    formatting_feedback: string;
  };
  star_interview_stories?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  }[];
  future_growth_potential?: {
    career_growth_trajectory: string;
    skills_forecast: string[];
    industry_insights: string[];
  };
  personalized_learning_roadmap?: {
    course: string;
    platform: string;
    impact: string;
  }[];
  recruiter_friendly_summary?: string;
  dashboard_scores?: {
    overall_score: number;
    ats_readiness_score: number;
    score_explanation: string;
  };
  [key: string]: any;
}

interface ResultsCardProps {
  analysisResult: CvAnalysis;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ analysisResult }) => {
  console.log('ResultsCard - Component rendered with props:', { analysisResult });
  
  if (!analysisResult) {
    console.log('ResultsCard - No analysisResult provided');
    return null;
  }

  // Check if any sections exist in the data
  const hasContent = !!(
    analysisResult.profile_strengths?.skills?.length ||
    analysisResult.improvement_areas?.skills_gap?.length ||
    analysisResult.role_matching?.length ||
    analysisResult.resume_optimization?.bullet_rewrites?.length ||
    analysisResult.star_interview_stories?.length ||
    analysisResult.future_growth_potential?.career_growth_trajectory ||
    analysisResult.personalized_learning_roadmap?.length ||
    analysisResult.recruiter_friendly_summary ||
    analysisResult.dashboard_scores?.overall_score
  );

  console.log('ResultsCard - Has content:', hasContent);

  if (!hasContent) {
    console.log('ResultsCard - No content to display');
    return (
      <motion.div 
        className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-gray-200 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-gray-500 py-4">No analysis results available to display.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative max-w-3xl mx-auto space-y-6 px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl transform translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <motion.h2 
        className="text-2xl font-bold text-gray-800 mb-6 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Your CV Analysis Results
      </motion.h2>
      
      {/* Dashboard Scores - Show at the top */}
      {analysisResult.dashboard_scores && (
        <CollapsibleCard 
          title="CV Dashboard" 
          defaultOpen={true} 
          icon={<BarChart2 size={20} />}
          accentColor="#3b82f6"
        >
          <div className="py-2 mb-2">
            <div className="flex flex-wrap justify-center gap-6">
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1 text-center">Overall Score</div>
                <div className="relative">
                  <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 251.2", strokeDashoffset: 0 }}
                      animate={{ 
                        strokeDasharray: `${analysisResult.dashboard_scores.overall_score * 2.51} 251.2`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="50"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="font-bold text-2xl"
                      fill="#3b82f6"
                    >
                      {analysisResult.dashboard_scores.overall_score}
                    </text>
                    <text
                      x="50"
                      y="65"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="text-xs"
                      fill="#6b7280"
                    >
                      /100
                    </text>
                  </svg>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md border border-green-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1 text-center">ATS Readiness</div>
                <div className="relative">
                  <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 251.2", strokeDashoffset: 0 }}
                      animate={{ 
                        strokeDasharray: `${analysisResult.dashboard_scores.ats_readiness_score * 2.51} 251.2`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="50"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="font-bold text-2xl"
                      fill="#10b981"
                    >
                      {analysisResult.dashboard_scores.ats_readiness_score}
                    </text>
                    <text
                      x="50"
                      y="65"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="text-xs"
                      fill="#6b7280"
                    >
                      /100
                    </text>
                  </svg>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-6 text-gray-700 bg-gray-50 p-5 rounded-xl border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="leading-relaxed">{analysisResult.dashboard_scores.score_explanation}</p>
            </motion.div>
          </div>
        </CollapsibleCard>
      )}

      {/* Profile Strengths */}
      {analysisResult.profile_strengths && (
        <CollapsibleCard 
          title="Profile Strengths" 
          defaultOpen={true} 
          icon={<Award size={20} />}
          accentColor="#10b981"
        >
          <div className="space-y-6">
            {analysisResult.profile_strengths.skills && Array.isArray(analysisResult.profile_strengths.skills) && analysisResult.profile_strengths.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Key Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.profile_strengths.skills.map((skill, idx) => (
                    <motion.span 
                      key={idx} 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium border border-green-100 shadow-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                      whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
            
            {analysisResult.profile_strengths.core_competencies && Array.isArray(analysisResult.profile_strengths.core_competencies) && analysisResult.profile_strengths.core_competencies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2 2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Core Competencies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.profile_strengths.core_competencies.map((comp, idx) => (
                    <motion.span 
                      key={idx} 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100 shadow-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                      whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    >
                      {comp}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
            
            {analysisResult.profile_strengths.achievements && Array.isArray(analysisResult.profile_strengths.achievements) && analysisResult.profile_strengths.achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Key Achievements</h3>
                </div>
                <div className="space-y-3">
                  {analysisResult.profile_strengths.achievements.map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg border border-amber-100 shadow-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                      whileHover={{ x: 5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div className="flex">
                        <span className="text-amber-500 mr-2">✦</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </CollapsibleCard>
      )}

      {/* Improvement Areas */}
      {analysisResult.improvement_areas && (
        <CollapsibleCard 
          title="Areas for Improvement" 
          icon={<AlertTriangle size={20} />}
          accentColor="#f59e0b"
        >
          <div className="space-y-4">
            {analysisResult.improvement_areas.skills_gap && Array.isArray(analysisResult.improvement_areas.skills_gap) && analysisResult.improvement_areas.skills_gap.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills Gap</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {analysisResult.improvement_areas.skills_gap.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResult.improvement_areas.experience_gaps && Array.isArray(analysisResult.improvement_areas.experience_gaps) && analysisResult.improvement_areas.experience_gaps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Experience Gaps</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {analysisResult.improvement_areas.experience_gaps.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResult.improvement_areas.presentation_structure && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Presentation Improvements</h3>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-100">{analysisResult.improvement_areas.presentation_structure}</p>
              </div>
            )}
          </div>
        </CollapsibleCard>
      )}

      {/* Role Matching */}
      {analysisResult.role_matching && Array.isArray(analysisResult.role_matching) && analysisResult.role_matching.length > 0 && (
        <CollapsibleCard 
          title="Matching Roles" 
          icon={<Briefcase size={20} />}
          accentColor="#8b5cf6"
        >
          <div className="space-y-6">
            {analysisResult.role_matching.map((role, idx) => (
              <motion.div 
                key={idx} 
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  borderColor: "#c4b5fd" 
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div className="font-bold text-lg text-gray-900 mb-2 sm:mb-0">{role.role}</div>
                  <div className="flex flex-wrap gap-2">
                    <div className="text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 rounded-full shadow-sm">
                      {role.match_percentage}% Match
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
                      role.transition_difficulty === 'Easy' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : role.transition_difficulty === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {role.transition_difficulty} Transition
                    </span>
                  </div>
                </div>
                
                {/* Enhanced progress bar */}
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden mb-5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${role.match_percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${
                      role.match_percentage > 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      role.match_percentage > 60 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                      'bg-gradient-to-r from-yellow-400 to-orange-400'
                    }`}
                    style={{
                      borderRadius: '9999px',
                      boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-md z-10">
                      {role.match_percentage}% Match
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Required Skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {role.required_skills && Array.isArray(role.required_skills) && role.required_skills.map((skill, skillIdx) => (
                      <motion.span 
                        key={skillIdx} 
                        className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium border border-purple-100"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 + (skillIdx * 0.05) }}
                        whileHover={{ y: -2 }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Resume Optimization */}
      {analysisResult.resume_optimization && (
        <CollapsibleCard 
          title="Resume Optimization" 
          icon={<Edit size={20} />}
          accentColor="#14b8a6"
        >
          <div className="space-y-4">
            {analysisResult.resume_optimization.bullet_rewrites && Array.isArray(analysisResult.resume_optimization.bullet_rewrites) && analysisResult.resume_optimization.bullet_rewrites.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bullet Point Improvements</h3>
                <div className="space-y-4">
                  {analysisResult.resume_optimization.bullet_rewrites.map((rewrite, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <div className="font-semibold text-gray-900 mb-2">Original</div>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded">{rewrite.original}</p>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-2">Optimized</div>
                        <p className="text-gray-700 bg-green-50 p-3 rounded border border-green-100">{rewrite.optimized}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResult.resume_optimization.ats_keywords_missing && Array.isArray(analysisResult.resume_optimization.ats_keywords_missing) && analysisResult.resume_optimization.ats_keywords_missing.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Missing ATS Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.resume_optimization.ats_keywords_missing.map((keyword, idx) => (
                    <span key={idx} className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResult.resume_optimization.formatting_feedback && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Formatting Feedback</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-100">{analysisResult.resume_optimization.formatting_feedback}</p>
              </div>
            )}
          </div>
        </CollapsibleCard>
      )}

      {/* STAR Interview Stories */}
      {analysisResult.star_interview_stories && Array.isArray(analysisResult.star_interview_stories) && analysisResult.star_interview_stories.length > 0 && (
        <CollapsibleCard 
          title="STAR Interview Stories" 
          icon={<MessageSquare size={20} />}
          accentColor="#ec4899"
        >
          <div className="space-y-4">
            {analysisResult.star_interview_stories.map((story, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Situation</div>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded">{story.situation}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Task</div>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded">{story.task}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Action</div>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded">{story.action}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-2">Result</div>
                    <p className="text-gray-700 bg-green-50 p-3 rounded border border-green-100">{story.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Future Growth Potential */}
      {analysisResult.future_growth_potential && (
        <CollapsibleCard 
          title="Future Growth Potential" 
          icon={<BarChart2 size={20} />}
          accentColor="#6366f1"
        >
          <div className="space-y-4">
            {analysisResult.future_growth_potential.career_growth_trajectory && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Career Growth Trajectory</h3>
                <p className="text-gray-700 bg-indigo-50 p-4 rounded-lg border border-indigo-100">{analysisResult.future_growth_potential.career_growth_trajectory}</p>
              </div>
            )}
            
            {analysisResult.future_growth_potential.skills_forecast && Array.isArray(analysisResult.future_growth_potential.skills_forecast) && analysisResult.future_growth_potential.skills_forecast.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills to Develop</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.future_growth_potential.skills_forecast.map((skill, idx) => (
                    <span key={idx} className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResult.future_growth_potential.industry_insights && Array.isArray(analysisResult.future_growth_potential.industry_insights) && analysisResult.future_growth_potential.industry_insights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Industry Insights</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {analysisResult.future_growth_potential.industry_insights.map((insight, idx) => (
                    <li key={idx} className="text-gray-700">{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleCard>
      )}

      {/* Personalized Learning Roadmap */}
      {analysisResult.personalized_learning_roadmap && Array.isArray(analysisResult.personalized_learning_roadmap) && analysisResult.personalized_learning_roadmap.length > 0 && (
        <CollapsibleCard 
          title="Personalized Learning Roadmap" 
          icon={<BookOpen size={20} />}
          accentColor="#0ea5e9"
        >
          <div className="space-y-4">
            {analysisResult.personalized_learning_roadmap.map((item, idx) => (
              <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900 mb-1">{item.course}</div>
                <div className="text-sm text-gray-600 mb-2">Platform: {item.platform}</div>
                <p className="text-gray-700 text-sm">{item.impact}</p>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Recruiter Summary */}
      {analysisResult.recruiter_friendly_summary && (
        <CollapsibleCard 
          title="Recruiter Summary" 
          icon={<MessageSquare size={20} />}
          accentColor="#0891b2"
        >
          <p className="text-gray-700 whitespace-pre-line leading-relaxed italic bg-blue-50 p-4 rounded-lg">{analysisResult.recruiter_friendly_summary}</p>
        </CollapsibleCard>
      )}
    </motion.div>
  );
};

export default ResultsCard;