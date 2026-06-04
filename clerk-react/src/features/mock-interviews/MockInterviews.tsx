import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import {
  MessageCircle,
  Sparkles,
  AlertTriangle,
  Loader2,
  Code2,
  Users,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';
import { getInterviewQuestions } from '../../api/interview';
import { EXPERIENCE_LEVELS } from '../../types/interview';
import type { InterviewQuestion } from '../../types/interview';

// Visual treatment per question category — falls back to a neutral style.
const categoryStyle = (category: string): { icon: React.ReactNode; badge: string } => {
  const key = category.toLowerCase();
  if (key.includes('technical')) {
    return { icon: <Code2 size={18} />, badge: 'bg-blue-100 text-blue-700' };
  }
  if (key.includes('behav')) {
    return { icon: <Users size={18} />, badge: 'bg-emerald-100 text-emerald-700' };
  }
  if (key.includes('problem')) {
    return { icon: <Lightbulb size={18} />, badge: 'bg-amber-100 text-amber-700' };
  }
  return { icon: <MessageCircle size={18} />, badge: 'bg-gray-100 text-gray-700' };
};

const difficultyStyle = (difficulty: string): string => {
  const key = difficulty.toLowerCase();
  if (key.includes('easy')) return 'bg-green-100 text-green-700';
  if (key.includes('hard')) return 'bg-red-100 text-red-700';
  if (key.includes('med')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};

const QuestionCard: React.FC<{ q: InterviewQuestion; index: number }> = ({ q, index }) => {
  const [open, setOpen] = useState(false);
  const { icon, badge } = categoryStyle(q.category);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {q.category && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>
              {icon}
              {q.category}
            </span>
          )}
          {q.difficulty && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyStyle(q.difficulty)}`}>
              {q.difficulty}
            </span>
          )}
        </div>
        <p className="text-gray-900 text-lg font-medium leading-relaxed">
          <span className="text-blue-600 mr-2">{index + 1}.</span>
          {q.question}
        </p>
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
          {open ? 'Hide tips' : 'How to approach this'}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-4 leading-relaxed">
                Structure your answer with the <span className="font-semibold">STAR</span> method —
                describe the <span className="font-semibold">S</span>ituation, the{' '}
                <span className="font-semibold">T</span>ask you owned, the{' '}
                <span className="font-semibold">A</span>ction you took, and the measurable{' '}
                <span className="font-semibold">R</span>esult. Be specific and quantify impact
                where you can.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const MockInterviews: React.FC = () => {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState<string>(EXPERIENCE_LEVELS[1]);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = role.trim();
    if (!trimmed) {
      setError('Please enter a target role.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await getInterviewQuestions(trimmed, level, token ?? undefined);
      if (result.length === 0) {
        setError('No questions were generated. Please try again.');
      }
      setQuestions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <div className="pt-5">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">Mock Interviews</h1>
        <p className="text-center text-gray-600 text-lg max-w-3xl mx-auto mb-10">
          Generate role-specific interview questions tailored to your target position and
          experience level. Practice your answers and walk into the real thing with confidence.
        </p>

        <form
          onSubmit={handleGenerate}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                Target role
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Product Manager"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1.5">
                Experience level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <motion.button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Questions
                </>
              )}
            </motion.button>
          </div>
        </form>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertTriangle className="mr-2 flex-shrink-0 text-red-500" size={20} />
              <div>
                <p className="font-medium">Something went wrong</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 flex-shrink-0 hover:bg-red-100 p-1 rounded transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        {questions && questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {questions.length} questions for a {level} {role.trim()}
            </h2>
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </div>
        )}

        {!questions && !isLoading && !error && (
          <div className="text-center text-gray-400 py-12">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-40" />
            <p>Enter a role above to generate your practice questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviews;
