import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Layers,
  FolderGit2,
  CheckCircle2,
  Info,
  Calendar,
  Zap,
  GitMerge,
  Award,
  ChevronRight,
  Play
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { HeroProgressRing } from '../components/common/HeroProgressRing';
import { WhyModal } from '../components/common/WhyModal';
import { Recommendation, Project } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [recRes, planRes, analyticsRes, projRes] = await Promise.all([
          api.getNextAction(),
          api.getWeeklyPlan(),
          api.getAnalyticsOverview(),
          api.getProjects()
        ]);
        setRecommendation(recRes.recommendation);
        setWeeklyPlan(planRes.weekly_plan);
        setAnalyticsOverview(analyticsRes);
        setProjects(projRes.projects || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const readinessScore = analyticsOverview?.readiness?.overall_readiness || 72;
  const metrics = analyticsOverview?.metrics || {
    total_hours: 35.6,
    current_streak: user?.profile?.current_streak || 6,
    skills_mastered: 4,
    projects_completed: 1
  };

  const greetingName = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Ashutosh';
  const targetRole = user?.profile?.target_career?.title || 'Full Stack Developer';

  return (
    <div className="space-y-6">
      {/* 1. TOP GREETING & CONNECTED OVERVIEW BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#11131c]/95 to-slate-900/90 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SKILLFORGE INTELLIGENCE ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good morning, {greetingName}.
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              You are <span className="text-cyan-400 font-bold font-mono">{readinessScore}%</span> through your {targetRole} career readiness benchmark.
            </p>
          </div>

          {/* Connected Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full lg:w-auto bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/40 text-left">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Streak</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-base font-bold text-white font-mono">{metrics.current_streak} days</span>
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/40 text-left">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Study Hours</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-base font-bold text-white font-mono">{metrics.total_hours}h</span>
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/40 text-left">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Mastered</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-base font-bold text-white font-mono">{metrics.skills_mastered} skills</span>
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/40 text-left">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Projects</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FolderGit2 className="w-4 h-4 text-violet-400" />
                <span className="text-base font-bold text-white font-mono">{metrics.projects_completed} live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT: HERO PROGRESS + INTELLIGENT NEXT BEST ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Central Hero Progress Visualization (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 flex flex-col items-center justify-between backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-violet-400" /> Career Readiness Index
            </span>
            <NavLink
              to="/analytics"
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-0.5"
            >
              Deep Analysis <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="my-3">
            <HeroProgressRing progress={readinessScore} size={190} strokeWidth={14} />
          </div>

          {/* 4 Connected Satellite Factors */}
          <div className="w-full grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Skills Mastery</span>
                <span className="text-white font-mono font-bold">{analyticsOverview?.readiness?.breakdown?.skills || 78}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${analyticsOverview?.readiness?.breakdown?.skills || 78}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Projects Portfolio</span>
                <span className="text-white font-mono font-bold">{analyticsOverview?.readiness?.breakdown?.projects || 65}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${analyticsOverview?.readiness?.breakdown?.projects || 65}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Assessments</span>
                <span className="text-white font-mono font-bold">{analyticsOverview?.readiness?.breakdown?.assessments || 81}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analyticsOverview?.readiness?.breakdown?.assessments || 81}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Consistency</span>
                <span className="text-white font-mono font-bold">{analyticsOverview?.readiness?.breakdown?.consistency || 69}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${analyticsOverview?.readiness?.breakdown?.consistency || 69}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Next Best Action Card (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-violet-950/20 via-[#11131c]/90 to-indigo-950/20 border border-violet-500/30 p-6 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden shadow-2xl">
          {/* Top Label with Signature "Why this?" Button */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-violet-600/30 border border-violet-500/40 text-violet-300 text-[11px] font-bold uppercase tracking-wider font-mono">
                  Next Best Action
                </span>
                <span className="text-xs text-slate-400">AI & Gap Driven</span>
              </div>

              {/* Signature Explainability Trigger */}
              <button
                onClick={() => setShowWhyModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-violet-500/60 text-slate-300 hover:text-white text-xs font-semibold transition"
                title="View underlying engine reasoning"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Why this?</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {recommendation?.title || 'Master React 19 & Custom Hooks'}
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              {recommendation?.description ||
                'You have completed JavaScript fundamentals and your target Full Stack role requires advanced React. Complete the custom hooks module to close your 23% gap.'}
            </p>

            {/* Micro factors snippet */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Prerequisites satisfied: JavaScript (ES6+) & HTML/CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>High impact on {targetRole} benchmark score</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Est. 2.5 hours remaining</span>
            </div>

            <NavLink
              to={recommendation?.link || '/roadmap'}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-violet-600/30"
            >
              {recommendation?.cta_label || 'Continue Learning'} <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* 3. SMART WEEKLY PLAN & ACTIVE PROJECTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Smart Weekly Plan (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <h3 className="font-bold text-base text-white">Smart Weekly Plan</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              Goal: {weeklyPlan?.target_hours || 10}h / week
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Weekly Velocity</span>
              <span className="font-mono text-white">{weeklyPlan?.completed_hours || 4.5}h / {weeklyPlan?.target_hours || 10}h ({weeklyPlan?.progress_percent || 45}%)</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: `${weeklyPlan?.progress_percent || 45}%` }} />
            </div>
          </div>

          <div className="space-y-2.5">
            {weeklyPlan?.tasks?.map((t: any) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs transition hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-md ${t.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {t.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{t.skill} • {t.allocated_hours}h</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {t.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Project Card (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Active Portfolio Artifact</h3>
              </div>
              <NavLink to="/projects" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                All Projects →
              </NavLink>
            </div>

            {projects.length > 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      {projects[0].status} • {projects[0].difficulty}
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-0.5">{projects[0].title}</h4>
                  </div>
                  <span className="text-sm font-bold font-mono text-cyan-400">
                    {projects[0].progress_percent}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {projects[0].description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {projects[0].technologies?.map((tech, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No active projects. Start your first portfolio project to unlock project readiness.
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">GitHub Sync Detected (4 commits)</span>
            <NavLink
              to="/projects"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Manage Milestones
            </NavLink>
          </div>
        </div>
      </div>

      {/* Signature Explainability Dialog */}
      <WhyModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        title={recommendation?.title || 'Master React 19 & Custom Hooks'}
        careerTarget={recommendation?.target_career || targetRole}
        reasons={
          recommendation?.why_explanation?.reasons || [
            'You completed JavaScript fundamentals with 75% verified proficiency',
            'React 19 is a core Tier-1 requirement for Full Stack Developer roles (Target: 85%)',
            'Your recent assessment indicates need for custom hook and transition mastery',
            'Fits within your 12 hrs/week allocated study time'
          ]
        }
      />
    </div>
  );
};
