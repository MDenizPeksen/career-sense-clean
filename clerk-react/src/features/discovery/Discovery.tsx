import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Send,
  Sparkles,
  AlertTriangle,
  Loader2,
  Bot,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  startDiscoverySession,
  sendDiscoveryMessage,
  getActiveDiscoverySession,
} from '../../api/discovery';
import type { DiscoverySession, EnrichedProfile } from '../../types/discovery';

// ---- Enriched-profile summary (shown when the session completes) -------------

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
    {children}
  </span>
);

const Field: React.FC<{ label: string; value?: string | null }> = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-gray-800 mt-0.5">{value}</p>
    </div>
  ) : null;

const ProfileSummary: React.FC<{ profile: EnrichedProfile }> = ({ profile }) => {
  const roles = profile.target_roles?.filter(Boolean) ?? [];
  const industries = profile.target_industries?.filter(Boolean) ?? [];
  const strengths = profile.strengths_to_leverage?.filter(Boolean) ?? [];
  const c = profile.constraints ?? {};

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-4 text-emerald-600">
        <CheckCircle2 size={22} />
        <h2 className="text-xl font-semibold text-gray-900">Your discovery profile</h2>
      </div>

      {profile.headline && (
        <p className="text-lg text-gray-900 font-medium mb-6">{profile.headline}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Motivation" value={profile.motivation} />
        <Field label="Current situation" value={profile.current_situation} />
        <Field label="Risk tolerance" value={profile.risk_tolerance ?? undefined} />
        <Field label="Learning preferences" value={profile.learning_preferences ?? undefined} />
        <Field label="Location" value={c.location ?? undefined} />
        <Field label="Timeline" value={c.timeline ?? undefined} />
        <Field label="Compensation" value={c.compensation ?? undefined} />
      </div>

      {roles.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Target roles
          </p>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <Pill key={r}>{r}</Pill>
            ))}
          </div>
        </div>
      )}

      {industries.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Target industries
          </p>
          <div className="flex flex-wrap gap-2">
            {industries.map((i) => (
              <Pill key={i}>{i}</Pill>
            ))}
          </div>
        </div>
      )}

      {strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Strengths to leverage
          </p>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ---- Chat bubble -------------------------------------------------------------

const Bubble: React.FC<{ role: 'user' | 'assistant'; content: string }> = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-600'
        }`}
      >
        {isUser ? <UserIcon size={18} /> : <Bot size={18} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
};

// ---- Page --------------------------------------------------------------------

const Discovery: React.FC = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [input, setInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isResuming, setIsResuming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isComplete = session?.status === 'completed';

  // Resume an in-progress session on mount, if there is one.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const active = await getActiveDiscoverySession(token ?? undefined);
        if (!cancelled && active) setSession(active);
      } catch {
        // Non-fatal: the user can just start a fresh session.
      } finally {
        if (!cancelled) setIsResuming(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  // Keep the transcript scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [session?.messages.length, isSending]);

  const handleStart = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const token = await getToken();
      const started = await startDiscoverySession(token ?? undefined);
      setSession(started);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the conversation.');
    } finally {
      setIsStarting(false);
    }
  }, [getToken]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || !session || isSending || isComplete) return;

      setIsSending(true);
      setError(null);
      // Optimistically render the user's message while the agent thinks.
      setSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, { role: 'user', content: trimmed }] } : prev
      );
      setInput('');
      try {
        const token = await getToken();
        const updated = await sendDiscoveryMessage(session.id, trimmed, token ?? undefined);
        setSession(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Your message could not be sent.');
        // Roll the optimistic message back out so the user can retry.
        setSession((prev) =>
          prev ? { ...prev, messages: prev.messages.filter((m) => m.content !== trimmed) } : prev
        );
        setInput(trimmed);
      } finally {
        setIsSending(false);
      }
    },
    [input, session, isSending, isComplete, getToken]
  );

  // ---- Intro (no session yet) ----
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-6">
        <div className="pt-5 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white mb-6">
            <Compass size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Discovery</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            A short, guided conversation to really understand where you are and where you want to
            go. We'll use it to find the roles you can shift into and the skills worth learning.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 inline-flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <motion.button
            onClick={handleStart}
            disabled={isStarting || isResuming}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: isStarting || isResuming ? 1 : 1.05 }}
            whileTap={{ scale: isStarting || isResuming ? 1 : 0.98 }}
          >
            {isResuming ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Checking for a saved conversation…
              </>
            ) : isStarting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Start the conversation
              </>
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  // ---- Active / completed session ----
  return (
    <div className="max-w-3xl mx-auto my-8 px-6">
      <div className="pt-5">
        <div className="flex items-center gap-2 mb-2">
          <Compass size={24} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Career Discovery</h1>
        </div>
        <p className="text-gray-600 mb-6">
          {isComplete
            ? "Here's what we learned. You can use it to explore matching roles next."
            : 'Answer in your own words — there are no wrong answers.'}
        </p>

        <div
          ref={scrollRef}
          className="bg-gray-50 rounded-2xl border border-gray-100 p-4 md:p-6 space-y-4 max-h-[55vh] overflow-y-auto"
        >
          {session.messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}

          {isSending && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
                <Loader2 size={18} className="animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mt-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!isComplete ? (
          <form onSubmit={handleSend} className="mt-4 flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e);
                }
              }}
              rows={2}
              placeholder="Type your answer…"
              disabled={isSending}
              className="flex-1 resize-none px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50"
            />
            <motion.button
              type="submit"
              disabled={isSending || !input.trim()}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileTap={{ scale: 0.97 }}
            >
              <Send size={18} />
            </motion.button>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            <AnimatePresence>
              {session.enrichedProfile && <ProfileSummary profile={session.enrichedProfile} />}
            </AnimatePresence>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-blue-600 font-medium border border-blue-200 hover:bg-blue-50 transition-all"
              >
                Go to dashboard
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
