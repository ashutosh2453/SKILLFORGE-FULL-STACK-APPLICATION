import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  GitMerge,
  Target,
  BarChart3,
  Layers,
  FolderGit2,
  ShieldCheck,
  CheckCircle2,
  Users,
  Zap,
  ChevronRight,
  Code2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
  const { demoLogin, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'graph' | 'gap' | 'readiness'>('graph');

  const handleQuickDemo = async (role: 'student' | 'mentor' | 'admin') => {
    await demoLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 selection:bg-violet-500/30 overflow-x-hidden bg-radial-glow bg-grid-pattern">
      {/* Navigation Header */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl bg-[#090a0f]/80 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">SkillForge</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
          <a href="#how-it-works" className="hover:text-violet-400 transition">How It Works</a>
          <a href="#features" className="hover:text-violet-400 transition">Platform</a>
          <a href="#gap-engine" className="hover:text-violet-400 transition">Gap Engine</a>
          <a href="#readiness" className="hover:text-violet-400 transition">Readiness Index</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <NavLink
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </NavLink>
          ) : (
            <>
              <button
                onClick={() => handleQuickDemo('student')}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-violet-500/60 text-slate-200 hover:text-white text-xs font-semibold transition"
              >
                Instant Demo
              </button>
              <NavLink
                to="/onboarding"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
              >
                Start Forging <ArrowRight className="w-4 h-4" />
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Top Tag Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium mb-6"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Career Engineering Engine for Modern Developers</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-[1.1]"
        >
          Forge the skills.{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Build the career.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Stop drifting through random tutorials. SkillForge diagnoses your exact skill gaps, generates a dynamic graph roadmap, and tracks your real-world career readiness.
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <NavLink
            to="/onboarding"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-violet-600/30 transition transform hover:-translate-y-0.5"
          >
            Start Forging Your Path
            <ArrowRight className="w-4 h-4" />
          </NavLink>
          <button
            onClick={() => handleQuickDemo('student')}
            className="px-6 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition hover:bg-slate-800/80"
          >
            Explore Live Demo Platform →
          </button>
        </motion.div>

        {/* Interactive Hero Visual Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto rounded-3xl bg-[#11131c]/90 border border-slate-800 shadow-2xl p-4 sm:p-8 backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Visual Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2 font-medium">skillforge.io/forge-engine</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('graph')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  activeTab === 'graph' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Roadmap Graph
              </button>
              <button
                onClick={() => setActiveTab('gap')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  activeTab === 'gap' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Skill Gap Engine
              </button>
              <button
                onClick={() => setActiveTab('readiness')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  activeTab === 'readiness' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Readiness 72%
              </button>
            </div>
          </div>

          {/* Interactive Tab Visuals */}
          {activeTab === 'graph' && (
            <div className="p-4 sm:p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80 relative">
              <div className="text-xs font-mono text-violet-400 mb-4 flex items-center justify-between">
                <span>TARGET: FULL STACK DEVELOPER (2026.2)</span>
                <span className="text-emerald-400">● 64% COMPLETED</span>
              </div>

              {/* Connected Graph Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-left">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
                    <span>FOUNDATION</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Semantic Web & JS</h4>
                  <p className="text-[11px] text-slate-400 mt-1">100% Verified • 40h</p>
                </div>

                <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/60 text-left shadow-lg shadow-violet-500/10">
                  <div className="flex items-center justify-between text-xs text-violet-400 font-semibold mb-1">
                    <span>ACTIVE FOCUS</span>
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <h4 className="font-bold text-sm text-white">React 19 & Custom Hooks</h4>
                  <p className="text-[11px] text-slate-400 mt-1">62% In Progress • 35h</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold mb-1">
                    <span>UPCOMING</span>
                    <GitMerge className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">PostgreSQL Indexing</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Available next • 25h</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 text-left opacity-60">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                    <span>CAPSTONE</span>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-300">PulseFlow Cloud SaaS</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Locked milestone • 40h</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gap' && (
            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-left space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>SKILL GAP AUDIT: 3 CRITICAL GAPS REMAINING</span>
                <span className="text-violet-400 font-bold">NEXT TARGET: 85%</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span className="font-semibold">React & Component Architecture</span>
                    <span className="text-amber-400 font-mono">Current 62% → Target 85% (Gap: 23%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[62%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span className="font-semibold">PostgreSQL Relational Indexing</span>
                    <span className="text-amber-400 font-mono">Current 60% → Target 80% (Gap: 20%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[60%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span className="font-semibold">Docker & CI/CD Pipelines</span>
                    <span className="text-rose-400 font-mono">Current 35% → Target 75% (Critical Gap: 40%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[35%]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'readiness' && (
            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex flex-col items-center justify-center font-mono font-extrabold text-2xl text-white shadow-lg">
                  72%
                  <span className="text-[9px] font-sans font-medium uppercase tracking-wider text-violet-200">Index</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Full Stack Developer Readiness</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Composite score computed from your verified assessments (81%), completed projects (65%), skills matrix (78%), and consistency streak (69%).
                  </p>
                </div>
              </div>
              <NavLink
                to="/onboarding"
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shrink-0"
              >
                Calculate Your Readiness →
              </NavLink>
            </div>
          )}
        </motion.div>
      </section>

      {/* 5 Core Questions Grid */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">The 5 Core Questions</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Engineered to guide your entire journey
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4">
            SkillForge replaces guessing with transparent, deterministic career analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-left">
          {[
            { num: '01', title: 'Where am I currently?', desc: 'Audits your existing codebase projects, verified assessments, and self-reported proficiencies.' },
            { num: '02', title: 'What do I need?', desc: 'Reverse-engineers real tier-1 industry job requirements for your target specialization.' },
            { num: '03', title: 'What am I missing?', desc: 'Calculates precision gaps across critical, moderate, and mastered competencies.' },
            { num: '04', title: 'What to learn next?', desc: 'Recommends next best actions with transparent "Why this?" rationale.' },
            { num: '05', title: 'Am I job-ready?', desc: 'Combines projects, assessments, and consistency into an honest readiness index.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/40 transition group"
            >
              <span className="font-mono text-xs font-extrabold text-violet-400 group-hover:text-cyan-400 transition">
                {item.num}
              </span>
              <h3 className="font-bold text-sm text-white mt-2 mb-1.5 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-8 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
            <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 w-fit mb-6">
              <GitMerge className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Graph Roadmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Never get lost in vertical checklists. Visual dependency graphs show prerequisites, active milestones, topic checklists, and projects for every node.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verified Skill Assessments</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Real timed coding challenges and concept checks diagnose weak areas, update your verified mastery, and unlock achievement badges.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-6">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Portfolio Project Forge</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Turn theoretical knowledge into verified software. Track milestones, link GitHub repositories, and display live demo artifacts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to forge your engineering career?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 mb-8">
            Join thousands of developers leveling up with precision skill gap analysis and bespoke roadmap graphs.
          </p>
          <div className="flex justify-center gap-4">
            <NavLink
              to="/onboarding"
              className="px-8 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition shadow-xl shadow-violet-600/30"
            >
              Start Forging Now →
            </NavLink>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 SkillForge Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
