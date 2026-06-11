import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Check, Loader2 } from 'lucide-react';
import { submitFeedback } from '../../api/engagement';
import { formatErrorMessage } from '../../lib/errorHandling';
import type { FeedbackCategory } from '../../types/engagement';

const CATEGORIES: FeedbackCategory[] = ['Bug', 'Idea', 'Other'];

/**
 * Floating feedback widget, mounted once globally so it's reachable from any
 * page. Opens a small modal with a category toggle, message, and an optional
 * email for follow-up. Submissions hit the public /api/feedback endpoint.
 */
const FeedbackWidget = () => {
  const { pathname } = useLocation();
  const { getToken } = useAuth();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('Idea');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const reset = () => {
    setCategory('Idea');
    setMessage('');
    setEmail('');
    setCompany('');
    setStatus('idle');
    setError('');
  };

  const close = () => {
    setOpen(false);
    // Reset shortly after the close animation so the form is fresh next time.
    setTimeout(reset, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please tell us a little about it.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const token = (await getToken()) ?? undefined;
      await submitFeedback(
        { message, category, email: email || undefined, pageUrl: pathname, company },
        token
      );
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(formatErrorMessage(err));
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700"
        aria-label="Send feedback"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={close} />

            <motion.div
              className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                onClick={close}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {status === 'sent' ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Thank you!</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Your feedback helps shape what we build next.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="mb-1 font-semibold text-gray-900">Share your feedback</h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Found a bug or have an idea? We read everything.
                  </p>

                  {/* Category toggle */}
                  <div className="mb-3 flex gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`flex-1 rounded-lg border px-2 py-1.5 text-sm transition-colors ${
                          category === c
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={4000}
                    placeholder="What's on your mind?"
                    className="mb-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional, for a reply)"
                    className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {/* Honeypot — hidden from real users */}
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />

                  {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      'Send feedback'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackWidget;
