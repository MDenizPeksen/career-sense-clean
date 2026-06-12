import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Mail, Check, Loader2 } from 'lucide-react';
import { submitContact } from '../../api/engagement';
import { formatErrorMessage } from '../../lib/errorHandling';

/**
 * Public contact page. Posts to /api/contact (shares the Feedback table with the
 * in-app widget, distinguished by type on the backend).
 */
const Contact = () => {
  const { getToken } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setError('Please add your email and a message.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const token = (await getToken()) ?? undefined;
      await submitContact({ name, email, message, company }, token);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(formatErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Mail size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Get in touch</h1>
        <p className="mt-2 text-gray-600">
          Questions, partnerships, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      {status === 'sent' ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check size={24} />
          </div>
          <h2 className="font-semibold text-gray-900">Message sent</h2>
          <p className="mt-1 text-sm text-gray-600">
            Thanks for reaching out — we'll get back to you soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={4000}
            placeholder="How can we help?"
            required
            className="mb-4 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              'Send message'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
