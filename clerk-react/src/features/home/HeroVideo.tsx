import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Briefcase, FileText, MessageSquare, BookOpen } from 'lucide-react';

const featurePills = [
  { icon: <Briefcase size={15} />, label: 'Matching roles' },
  { icon: <FileText size={15} />, label: 'Resume fixes' },
  { icon: <MessageSquare size={15} />, label: 'Interview prep' },
  { icon: <BookOpen size={15} />, label: 'Learning roadmap' },
];

/**
 * Full-viewport hero: a seamless ping-pong video background. The headline and
 * actions sit in the upper area (clear of the video's focal subject), with no
 * card chrome — the type itself carries a frosted-glass treatment, and the
 * feature set is shown as glass pills. Respects `prefers-reduced-motion`.
 */
const HeroVideo: React.FC = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <section className="relative -mt-8 min-h-[100svh] w-full overflow-hidden flex flex-col items-center justify-start text-center px-6 pt-[15vh] sm:pt-[13vh]">
      {/* Background media */}
      {reduceMotion ? (
        <img
          src="/media/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/media/hero-loop.mp4" type="video/mp4" />
        </video>
      )}

      {/* Scrim — weighted to the top half where the type sits, for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/30" />

      {/* Content (no card chrome) */}
      <motion.div
        className="relative z-10 max-w-3xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight text-white/95 [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
          Stop guessing your next step.{' '}
          <span className="text-blue-200/90">Turn your CV into a career you can see.</span>
        </h1>

        {/* Feature pills (glass) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-8">
          {featurePills.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md shadow-sm"
            >
              <span className="text-blue-200">{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={18} /> Analyze my CV
          </Link>
          <a
            href="#how-it-works"
            className="px-5 py-3 text-white/90 font-medium hover:text-white transition-colors [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]"
          >
            How it works
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroVideo;
