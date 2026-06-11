import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Briefcase,
  Target,
  MessageSquare,
  Award,
  BookOpen,
  ArrowRight,
  Search,
  Compass,
  TrendingUp,
} from 'lucide-react';
import HeroVideo from './HeroVideo';
import WaitlistSignup from './WaitlistSignup';

const features = [
  { icon: <FileText size={22} />, title: 'CV Analysis', text: 'Deep analysis of your strengths, gaps, and ATS keyword opportunities.' },
  { icon: <Briefcase size={22} />, title: 'Role Matching', text: 'Discover roles that fit your experience, with match scores and required skills.' },
  { icon: <Target size={22} />, title: 'Resume Optimization', text: 'Concrete bullet rewrites and formatting feedback to stand out to recruiters.' },
  { icon: <Award size={22} />, title: 'Career Archetype', text: 'Understand your professional identity and how to lean into your strengths.' },
  { icon: <MessageSquare size={22} />, title: 'Interview Prep', text: 'STAR-format interview stories drawn straight from your own experience.' },
  { icon: <BookOpen size={22} />, title: 'Learning Roadmap', text: 'A personalized plan of courses to bridge your skill gaps.' },
];

const steps = [
  { n: 1, title: 'Upload your CV', text: 'Drop in a PDF or DOCX — it never leaves the request.' },
  { n: 2, title: 'AI analyzes it', text: 'We extract your experience and run a structured career analysis.' },
  { n: 3, title: 'Get your insights', text: 'A full dashboard of roles, fixes, and next steps in seconds.' },
];

// The companion loop — what makes CareerSense more than a one-shot analyzer.
const journey = [
  {
    icon: <Search size={22} />,
    title: 'Understand',
    text: 'It starts with your CV, then a guided discovery conversation fills in your goals, constraints, and what you actually want.',
  },
  {
    icon: <Compass size={22} />,
    title: 'Discover',
    text: 'See the roles and career paths that genuinely fit you — with match scores, required skills, and where the gaps are.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Grow',
    text: 'Get a learning roadmap and track your progress over time. Your plan stays saved and evolves as you do.',
  },
];

const Home: React.FC = () => {
  return (
    <>
      {/* Full-viewport video hero */}
      <HeroVideo />

      <div className="max-w-6xl mx-auto px-6 pt-16">
      {/* Features */}
      <section className="pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="pb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-blue-600 text-white font-bold mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grows with you — the companion loop */}
      <section className="pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">A companion that grows with you</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            CareerSense isn't a one-time report. It builds an understanding of you
            and develops alongside you — the more you use it, the sharper it gets.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {journey.map((j, i) => (
            <motion.div
              key={j.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-4">
                {j.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{j.title}</h3>
              <p className="text-gray-600 text-sm">{j.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stay-updated waitlist */}
      <WaitlistSignup source="landing" />

      {/* CTA band */}
      <section className="pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl px-8 py-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to see what your CV says about you?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Start free in under a minute — then keep building from there.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors"
          >
            Analyze my CV <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      </div>
    </>
  );
};

export default Home;
