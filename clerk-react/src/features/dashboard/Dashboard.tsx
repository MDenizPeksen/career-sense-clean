import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  Award,
  Briefcase,
  FileText,
  TrendingUp,
  BookOpen,
  Target,
  Upload,
  Lightbulb,
  MessageSquare,
  Rocket,
  ListChecks,
  Loader2,
} from 'lucide-react';
import type { CvAnalysis, ArchetypeData } from '../../types/analysis';
import { getLatestAnalysis } from '../../api/cv';

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{children}</span>
);

// Map a next-action's points_to to an in-app route. 'resume' and 'learning' are
// sections on this same Dashboard page, so they get no navigation button.
function routeForPointsTo(pointsTo?: string): string | null {
  switch (pointsTo) {
    case 'career-paths': return '/career-paths';
    case 'discovery': return '/discovery';
    case 'interviews': return '/interviews';
    default: return null;
  }
}

const ConfidenceBadge: React.FC<{ confidence: 'high' | 'medium' | 'draft' }> = ({ confidence }) => {
  const styles: Record<string, string> = {
    high: 'bg-green-50 text-green-700',
    medium: 'bg-blue-50 text-blue-700',
    draft: 'bg-amber-50 text-amber-700',
  };
  const label = confidence === 'draft' ? 'Draft' : confidence === 'high' ? 'Well-evidenced' : 'Partly evidenced';
  return <span className={`text-xs px-2 py-1 rounded-full ${styles[confidence]}`}>{label}</span>;
};

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

// The backend may return three archetype shapes (simple, complex, inline).
// These helpers read each robustly without assuming one shape.
// Discriminate by unique keys: 'archetype' => Simple, 'explanation' => Complex,
// otherwise Inline (primary/secondary are plain strings).
function archetypeName(a: ArchetypeData): string {
  if ('archetype' in a) return a.archetype;
  if ('explanation' in a) return a.primary?.archetype ?? 'Career Archetype';
  return a.primary || 'Career Archetype';
}
function archetypeSecondary(a: ArchetypeData): string | undefined {
  if ('archetype' in a) return undefined;
  if ('explanation' in a) return a.secondary?.archetype;
  return a.secondary;
}
function archetypeDescription(a: ArchetypeData): string {
  if ('archetype' in a) return a.short_description || a.reasoning || '';
  if ('explanation' in a) return a.primary?.description || a.explanation || '';
  return a.description || '';
}
function archetypeStrengths(a: ArchetypeData): string[] {
  if ('archetype' in a) return [];
  if ('explanation' in a) return a.primary?.strengths ?? [];
  return a.strengths ?? [];
}
function archetypeGrowth(a: ArchetypeData): string[] {
  if ('archetype' in a) return [];
  if ('explanation' in a) return a.primary?.developmentAreas ?? [];
  return a.growthAreas ?? [];
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // A freshly uploaded analysis arrives via router state; otherwise load the
  // user's most recent persisted analysis from the backend.
  const fromState = (location.state as { analysisResult?: CvAnalysis } | null)?.analysisResult ?? null;
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(fromState);
  const [loading, setLoading] = useState(!fromState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fromState) return; // already have it from the upload flow
    let cancelled = false;
    setLoading(true);
    setError(null);
    getToken()
      .then((token) => getLatestAnalysis(token ?? undefined))
      .then((result) => {
        if (!cancelled) setAnalysis(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load your analysis.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromState, getToken]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 text-gray-500">
        <Loader2 size={32} className="mx-auto mb-4 animate-spin text-blue-600" />
        <p>Loading your analysis…</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
          <Upload size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">No analysis yet</h1>
        <p className="text-gray-600 mb-8">Upload your CV to see your personalized career analysis here.</p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
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

      {analysis.next_actions && analysis.next_actions.length > 0 && (
        <Section title="Your Next Moves" icon={<ListChecks size={20} />}>
          <ol className="space-y-3">
            {analysis.next_actions.map((a, i) => {
              const route = routeForPointsTo(a.points_to);
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{a.action}</p>
                    {a.why && <p className="text-gray-600 text-sm">{a.why}</p>}
                    {route && (
                      <button
                        onClick={() => navigate(route)}
                        className="mt-1 text-sm font-medium text-blue-700 hover:text-blue-800"
                      >
                        Go &rarr;
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
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
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-blue-700">{archetypeName(analysis.archetype)}</h3>
            {archetypeSecondary(analysis.archetype) && (
              <span className="text-sm text-gray-500">+ {archetypeSecondary(analysis.archetype)}</span>
            )}
          </div>
          <p className="text-gray-700">{archetypeDescription(analysis.archetype)}</p>
          {(archetypeStrengths(analysis.archetype).length > 0 ||
            archetypeGrowth(analysis.archetype).length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {archetypeStrengths(analysis.archetype).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Strengths</h4>
                  <List items={archetypeStrengths(analysis.archetype)} />
                </div>
              )}
              {archetypeGrowth(analysis.archetype).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Growth areas</h4>
                  <List items={archetypeGrowth(analysis.archetype)} />
                </div>
              )}
            </div>
          )}
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
          {resume.formatting_feedback && <p className="text-gray-700 text-sm mb-4">{resume.formatting_feedback}</p>}
          {resume.general_recommendations && resume.general_recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
              <List items={resume.general_recommendations} />
            </div>
          )}
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
                {item.learningLinks && item.learningLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {item.learningLinks.map((link, j) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {analysis.star_interview_stories && analysis.star_interview_stories.length > 0 && (
        <Section title="Interview Stories (STAR)" icon={<MessageSquare size={20} />}>
          <div className="space-y-4">
            {analysis.star_interview_stories.map((story, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  {story.title && <h4 className="font-semibold text-gray-800">{story.title}</h4>}
                  {story.confidence && <ConfidenceBadge confidence={story.confidence} />}
                </div>
                {story.confidence === 'draft' && (
                  <p className="text-xs text-amber-600 mb-2">
                    Starting point &mdash; refine this with your own details.
                  </p>
                )}
                <dl className="space-y-1 text-sm">
                  {(['situation', 'task', 'action', 'result'] as const).map((k) =>
                    story[k] ? (
                      <div key={k} className="flex gap-2">
                        <dt className="font-semibold text-gray-600 capitalize w-20 flex-shrink-0">{k}</dt>
                        <dd className="text-gray-700">{story[k]}</dd>
                      </div>
                    ) : null
                  )}
                </dl>
              </div>
            ))}
          </div>
        </Section>
      )}

      {analysis.future_growth_potential && (
        <Section title="Future Growth Potential" icon={<Rocket size={20} />}>
          {analysis.future_growth_potential.career_growth_trajectory && (
            <p className="text-gray-700 mb-4">{analysis.future_growth_potential.career_growth_trajectory}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.future_growth_potential.skills_forecast?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Skills to watch</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.future_growth_potential.skills_forecast.map((s, i) => (
                    <Pill key={i}>{s}</Pill>
                  ))}
                </div>
              </div>
            )}
            {analysis.future_growth_potential.industry_insights?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Industry insights</h4>
                <List items={analysis.future_growth_potential.industry_insights} />
              </div>
            )}
          </div>
        </Section>
      )}

      {analysis.career_development_insights && (
        <Section title="Career Development" icon={<Lightbulb size={20} />}>
          <div className="space-y-3 text-gray-700">
            {analysis.career_development_insights.strengths_leverage && (
              <p><span className="font-semibold">Leverage your strengths:</span> {analysis.career_development_insights.strengths_leverage}</p>
            )}
            {analysis.career_development_insights.networking_strategy && (
              <p><span className="font-semibold">Networking:</span> {analysis.career_development_insights.networking_strategy}</p>
            )}
            {analysis.career_development_insights.personal_branding_tips && (
              <p><span className="font-semibold">Personal branding:</span> {analysis.career_development_insights.personal_branding_tips}</p>
            )}
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
