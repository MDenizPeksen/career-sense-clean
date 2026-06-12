import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Check, Loader2 } from 'lucide-react';
import { joinWaitlist } from '../../api/engagement';
import { formatErrorMessage } from '../../lib/errorHandling';

interface WaitlistSignupProps {
  /** Where this form lives, stored with the entry (e.g. "landing", "footer"). */
  source: string;
  /** Compact single-line variant for the footer; default is the full section. */
  compact?: boolean;
}

/**
 * "Stay updated" email capture. Posts to the public /api/waitlist endpoint.
 * Renders as a full landing section by default, or a compact inline form when
 * `compact` is set (used in the footer).
 */
const WaitlistSignup = ({ source, compact = false }: WaitlistSignupProps) => {
  const { getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const token = (await getToken()) ?? undefined;
      await joinWaitlist({ email, source, company }, token);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(formatErrorMessage(err));
    }
  };

  const honeypot = (
    <input
      type="text"
      value={company}
      onChange={(e) => setCompany(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="hidden"
    />
  );

  if (compact) {
    return status === 'sent' ? (
      <p className="flex items-center gap-1.5 text-sm text-green-600">
        <Check size={16} /> You're on the list!
      </p>
    ) : (
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for updates"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {honeypot}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {status === 'sending' ? <Loader2 size={16} className="animate-spin" /> : 'Notify me'}
        </button>
      </form>
    );
  }

  return (
    <section className="pb-16">
      <div className="rounded-3xl border border-gray-100 bg-gray-50 px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Be part of what's next</h2>
        <p className="mx-auto mt-2 max-w-lg text-gray-600">
          CareerSense is growing fast. Drop your email to hear about new features
          as we build them — no spam, just the occasional update.
        </p>

        {status === 'sent' ? (
          <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-green-600">
            <Check size={20} />
            <span className="font-medium">You're on the list — thank you!</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {honeypot}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Joining…
                </>
              ) : (
                'Keep me posted'
              )}
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
};

export default WaitlistSignup;
