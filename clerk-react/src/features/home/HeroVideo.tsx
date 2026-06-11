import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Briefcase, FileText, MessageSquare, BookOpen, ChevronDown } from 'lucide-react';
import type { Transition } from 'framer-motion';

// Left-side and right-side floating pills around the island
const leftFeatures = [
  { icon: <Briefcase size={14} />, label: 'Matching roles',   delay: 0    },
  { icon: <FileText   size={14} />, label: 'Resume fixes',    delay: 0.7  },
];
const rightFeatures = [
  { icon: <MessageSquare size={14} />, label: 'Interview prep',    delay: 0.4  },
  { icon: <BookOpen      size={14} />, label: 'Learning roadmap',  delay: 1.1  },
];

const floatTransition = (delay: number): Transition => ({
  duration: 3.2,
  repeat: Infinity,
  repeatType: 'mirror',
  ease: 'easeInOut',
  delay,
});

const GlassPill = ({ icon, label, delay }: { icon: React.ReactNode; label: string; delay: number }) => (
  <motion.span
    animate={{ y: [0, -9, 0] }}
    transition={floatTransition(delay)}
    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur-lg shadow-md [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]"
  >
    <span className="text-blue-200">{icon}</span>
    {label}
  </motion.span>
);

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
    <section className="relative -mt-8 min-h-[100svh] w-full overflow-hidden flex flex-col text-center">
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

      {/* Scrim — stronger at top + bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/60" />

      {/* ── Headline — left side, above island, clear of the man ── */}
      <motion.div
        className="relative z-10 max-w-lg pl-8 sm:pl-14 lg:pl-20 pt-[13vh] sm:pt-[11vh] text-left"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-extrabold leading-tight tracking-tight">
          {/* White line on top */}
          <span className="block text-4xl sm:text-5xl lg:text-6xl text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]">
            Stop guessing your next step.
          </span>
          {/* Blue line below */}
          <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2 text-blue-200 [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
            Turn your CV into a career you can see.
          </span>
        </h1>
      </motion.div>

      {/* ── Floating feature pills (desktop: left/right columns; mobile: 2×2 grid) ── */}

      {/* Desktop left column */}
      <div className="hidden sm:flex absolute left-[5%] top-0 h-full flex-col items-start justify-center gap-5 z-10">
        {leftFeatures.map((f) => (
          <GlassPill key={f.label} {...f} />
        ))}
      </div>

      {/* Desktop right column */}
      <div className="hidden sm:flex absolute right-[5%] top-0 h-full flex-col items-end justify-center gap-5 z-10">
        {rightFeatures.map((f) => (
          <GlassPill key={f.label} {...f} />
        ))}
      </div>

      {/* Mobile: 2×2 grid below headline */}
      <div className="sm:hidden relative z-10 mx-auto mt-8 grid grid-cols-2 gap-3 px-4">
        {[...leftFeatures, ...rightFeatures].map((f) => (
          <GlassPill key={f.label} {...f} />
        ))}
      </div>

      {/* ── CTAs pinned to the bottom ── */}
      <motion.div
        className="relative z-10 mt-auto mb-10 sm:mb-14 flex flex-col sm:flex-row items-center justify-center gap-4 px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Primary CTA */}
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white font-semibold shadow-xl hover:bg-blue-700 transition-colors text-base"
        >
          <Upload size={18} /> Analyze my CV
        </Link>

        {/* Secondary CTA — glass pill with down arrow */}
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white font-medium hover:bg-white/20 transition-colors shadow-md [text-shadow:0_1px_8px_rgba(0,0,0,0.4)] text-base"
        >
          How it works <ChevronDown size={17} />
        </a>
      </motion.div>
    </section>
  );
};

export default HeroVideo;
