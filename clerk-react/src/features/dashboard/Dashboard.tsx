import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  FileText,
  TrendingUp,
  BookOpen,
  Target,
  Upload,
} from 'lucide-react';
import type { CvAnalysis, ArchetypeData } from '../../types/analysis';

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{children}</span>
);

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

const List: React.FC<{ items?: string[]; empty?: string }> = ({ items, empty }) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-400 text-sm">{empty ?? 'Not provided.'}</p>;
  }
  return (
    <ul className="list-disc list-inside space-y-1 text-gray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};

function getArchetypeName(a: ArchetypeData): string {
  return 'archetype' in a ? a.archetype : a.primary?.archetype ?? 'Career Archetype';
}
function getArchetypeDescription(a: ArchetypeData): string {
  if ('archetype' in a) return a.short_description || a.reasoning || '';
  return a.primary?.description || a.explanation || '';
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = (location.state as { analysisResult?: CvAnalysis } | null)?.analysisResult;

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
          <Upload size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">No analysis yet</h1>
        <p className="text-gray-600 mb-8">Upload your CV to see your personalized career analysis here.</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Analyze my CV
        </button>
      </div>
    );
  }

  const profile = analysis.user_profile;
  const strengths = analysis.profile_strengths;
  const detail = analysis.analysis;
  const roles = analysis.role_matching ?? [];
  const resume = analysis.resume_optimization;
  const roadmap = analysis.personalized_learning_roadmap ?? [];

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Career Analysis</h1>
      <p className="text-gray-600 mb-8">AI-generated insights based on your CV.</p>

      {analysis.recruiter_friendly_summary && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-6">
          <p className="text-lg leading-relaxed">{analysis.recruiter_friendly_summary}</p>
        </div>
      )}

      {profile && (profile.name || profile.current_role) && (
        <Section title="Profile" icon={<FileText size={20} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            {profile.name && <div><span className="font-semibold">Name:</span> {profile.name}</div>}
            {profile.current_role && <div><span className="font-semibold">Role:</span> {profile.current_role}</div>}
            {profile.sector && <div><span className="font-semibold">Sector:</span> {profile.sector}</div>}
            {profile.location && <div><span className="font-semibold">Location:</span> {profile.location}</div>}
            {!!profile.years_experience && (
              <div><span className="font-semibold">Experience:</span> {profile.years_experience} years</div>
            )}
          </div>
        </Section>
      )}

      {analysis.archetype && (
        <Section title="Career Archetype" icon={<Award size={20} />}>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">{getArchetypeName(analysis.archetype)}</h3>
          <p className="text-gray-700">{getArchetypeDescription(analysis.archetype)}</p>
        </Section>
      )}

      {strengths && (
        <Section title="Strengths" icon={<TrendingUp size={20} />}>
          {strengths.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {strengths.skills.map((s, i) => (
                  <Pill key={i}>{s}</Pill>
                ))}
              </div>
            </div>
          )}
          {strengths.core_competencies.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Core competencies</h4>
              <List items={strengths.core_competencies} />
            </div>
          )}
          {strengths.achievements.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Achievements</h4>
              <List items={strengths.achievements} />
            </div>
          )}
        </Section>
      )}

      {detail && (
        <Section title="Analysis" icon={<Target size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Strengths</h4>
              <List items={detail.strengths} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Improvement areas</h4>
              <List items={detail.improvement_areas} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Missing elements</h4>
              <List items={detail.missing_elements} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Keyword optimization</h4>
              <List items={detail.keyword_optimization} />
            </div>
          </div>
        </Section>
      )}

      {roles.length > 0 && (
        <Section title="Matching Roles" icon={<Briefcase size={20} />}>
          <div className="space-y-4">
            {roles.map((role, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{role.role}</h4>
                  {typeof role.match_percentage === 'number' && (
                    <span className="text-sm font-medium text-blue-700">{role.match_percentage}% match</span>
                  )}
                </div>
                {role.role_description && <p className="text-gray-600 text-sm mb-2">{role.role_description}</p>}
                <div className="flex flex-wrap gap-2">
                  {role.required_skills?.map((s, j) => (
                    <Pill key={j}>{s}</Pill>
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  {role.transition_difficulty && <span>Transition: {role.transition_difficulty}</span>}
                  {role.salary_range && <span>Salary: {role.salary_range}</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume && (
        <Section title="Resume Optimization" icon={<FileText size={20} />}>
          {resume.bullet_rewrites?.length > 0 && (
            <div className="mb-4 space-y-3">
              {resume.bullet_rewrites.map((b, i) => (
                <div key={i} className="text-sm">
                  <p className="text-gray-400 line-through">{b.original}</p>
                  <p className="text-gray-800">{b.optimized}</p>
                </div>
              ))}
            </div>
          )}
          {resume.ats_keywords_missing?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Missing ATS keywords</h4>
              <div className="flex flex-wrap gap-2">
                {resume.ats_keywords_missing.map((k, i) => (
                  <Pill key={i}>{k}</Pill>
                ))}
              </div>
            </div>
          )}
          {resume.formatting_feedback && <p className="text-gray-700 text-sm">{resume.formatting_feedback}</p>}
        </Section>
      )}

      {roadmap.length > 0 && (
        <Section title="Learning Roadmap" icon={<BookOpen size={20} />}>
          <div className="space-y-3">
            {roadmap.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">{item.course}</h4>
                  <span className="text-sm text-gray-500">{item.platform}</span>
                </div>
                {item.impact && <p className="text-gray-600 text-sm mt-1">{item.impact}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {item.difficulty && <span>{item.difficulty}</span>}
                  {item.duration && <span>{item.duration}</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Analyze another CV
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
