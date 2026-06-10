import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import {
  Route as RouteIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
  Database,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { getCareerPaths } from '../../api/careerPaths';
import type { CareerPathsResult, CareerTransition } from '../../types/careerPaths';

// Difficulty → badge colour.
const difficultyStyle = (d: string | null): string => {
  const key = (d || '').toLowerCase();
  if (key.includes('easy')) return 'bg-green-100 text-green-700';
  if (key.includes('challeng') || key.includes('hard')) return 'bg-red-100 text-red-700';
  if (key.includes('mod')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};

// Small labelled chip group.
const SkillChips: React.FC<{ skills: string[]; tone: 'have' | 'gap' }> = ({ skills, tone }) => {
  if (!skills.length) return null;
  const cls =
    tone === 'have' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <span key={s} className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
          {s}
        </span>
      ))}
    </div>
  );
};

const TransitionCard: React.FC<{ t: CareerTransition; index: number }> = ({ t, index }) => (
  <motion.div
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
  >
    <div className="flex items-start justify-between gap-4 mb-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
        {t.code && <p className="text-xs text-gray-400 mt-0.5">O*NET {t.code}</p>}
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {typeof t.matchPercentage === 'number' && (
          <span className="text-sm font-bold text-blue-600">{t.matchPercentage}% match</span>
        )}
        {t.difficulty && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyStyle(t.difficulty)}`}>
            {t.difficulty}
          </span>
        )}
      </div>
    </div>

    {t.description && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{t.description}</p>}
    {t.salaryRange && (
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-medium text-gray-700">Typical pay:</span> {t.salaryRange}
      </p>
    )}

    {t.sharedSkills.length > 0 && (
      <div className="mb-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">
          <CheckCircle2 size={14} /> Skills you already have ({t.sharedSkills.length})
        </p>
        <SkillChips skills={t.sharedSkills} tone="have" />
      </div>
    )}

    {t.skillGap.length > 0 && (
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">
          <Target size={14} /> Skills to build ({t.skillGap.length})
        </p>
        <SkillChips skills={t.skillGap} tone="gap" />
      </div>
    )}

    {t.sharedSkills.length === 0 && t.skillGap.length === 0 && (
      <p className="text-sm text-gray-400">No skill data available for this role yet.</p>
    )}
  </motion.div>
);

// Banner explaining where the data came from (builds trust; flags AI-derived).
const SourceBadge: React.FC<{ source: CareerPathsResult['source'] }> = ({ source }) => {
  if (source === 'onet') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">
        <Database size={14} /> Grounded in O*NET labor-market data
      </span>
    );
  }
  if (source === 'analysis') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700">
        <Sparkles size={14} /> AI-derived from your CV analysis
      </span>
    );
  }
  return null;
};

const CareerPaths: React.FC = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<CareerPathsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await getCareerPaths(token ?? undefined);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load career paths.');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <div className="pt-5">
        <div className="flex items-center gap-2 mb-2">
          <RouteIcon size={26} className="text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Career Paths</h1>
        </div>
        <p className="text-gray-600 text-lg mb-6">
          Roles you can realistically shift into — with the skills you already bring and the ones
          worth building next.
        </p>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p>Mapping your career paths…</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {/* Empty state — no analysis yet */}
            {data.transitions.length === 0 ? (
              <div className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-gray-100">
                <RouteIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p className="mb-4">{data.message || 'No career paths to show yet.'}</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all"
                >
                  Analyze my CV
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <SourceBadge source={data.source} />
                  {data.currentRole && (
                    <p className="text-sm text-gray-500">
                      From <span className="font-medium text-gray-700">{data.currentRole}</span>
                    </p>
                  )}
                </div>

                {data.topSkillGaps.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-8">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                      <TrendingUp size={18} className="text-blue-600" />
                      Highest-leverage skills to learn
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      These show up most across your matching roles — learning them opens the most
                      doors.
                    </p>
                    {data.learningLinks != null ? (
                      data.learningLinks.length > 0 && (
                        <div className="flex flex-col gap-3">
                          {data.learningLinks.map(({ skill, courses }) => (
                            <div key={skill} className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-800 w-36 shrink-0">{skill}</span>
                              {courses.map(({ provider, title, url }) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={title}
                                  title={title}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 transition-colors"
                                >
                                  {provider}
                                  <ExternalLink size={11} />
                                </a>
                              ))}
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {data.topSkillGaps.map((s) => (
                          <span
                            key={s}
                            className="text-sm font-medium px-3 py-1.5 rounded-full bg-white text-blue-700 border border-blue-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {data.transitions.map((t, i) => (
                    <TransitionCard key={`${t.title}-${i}`} t={t} index={i} />
                  ))}
                </div>

                {!data.onetConfigured && (
                  <p className="text-xs text-gray-400 mt-6 text-center">
                    Tip: connect O*NET (free) to ground these skills in real labor-market data.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CareerPaths;
