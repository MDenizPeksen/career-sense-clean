import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared layout for the static legal pages (Terms, Privacy). Provides the
 * heading, last-updated line, the "template pending review" banner, and prose
 * styling so both pages stay visually consistent.
 */
const LegalShell = ({ title, lastUpdated, children }: LegalShellProps) => (
  <div className="mx-auto max-w-3xl px-6 py-12">
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <p className="mt-1 text-sm text-gray-500">Last updated: {lastUpdated}</p>

    <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p>
        This is a good-faith template, not legal advice. Please have it reviewed
        by a qualified professional before relying on it. Questions? Reach us via
        the <Link to="/contact" className="font-medium underline">contact page</Link>.
      </p>
    </div>

    <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-gray-700">{children}</div>
  </div>
);

interface SectionProps {
  heading: string;
  children: ReactNode;
}

/** A titled block within a legal page, for consistent spacing/typography. */
export const Section = ({ heading, children }: SectionProps) => (
  <section>
    <h2 className="mb-2 text-lg font-semibold text-gray-900">{heading}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export default LegalShell;
