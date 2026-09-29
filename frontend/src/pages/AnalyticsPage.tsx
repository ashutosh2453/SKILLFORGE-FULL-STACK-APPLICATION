import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  Clock,
  Layers,
  FolderGit2,
  CheckSquare,
  Flame,
  ShieldCheck,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then(res => setAnalytics(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const readiness = analytics?.readiness || {
    overall_readiness: 72,
    breakdown: { skills: 78, projects: 65, assessments: 81, consistency: 69 },
    strongest_area: 'Assessment Performance',
    focus_area: 'Project Portfolio',
    disclaimer: 'SkillForge Readiness Index is a developmental metric calculated from your completed milestones, verified assessments, and projects. It is not an external hiring guarantee.'
  };

  const radarData = analytics?.radar_chart || [
    { category: 'Frontend', current: 75, target: 85, fullMark: 100 },
    { category: 'Backend', current: 65, target: 85, fullMark: 100 },
    { category: 'Database', current: 60, target: 80, fullMark: 100 },
    { category: 'DevOps', current: 35, target: 75, fullMark: 100 },
    { category: 'AI/ML', current: 20, target: 70, fullMark: 100 },
    { category: 'System Design', current: 35, target: 75, fullMark: 100 },
    { category: 'Soft Skills', current: 70, target: 80, fullMark: 100 }
  ];

  const timelineData = analytics?.assessment_timeline || [
    { date: 'Sep 10', score: 60, title: 'HTML & CSS Foundations' },
    { date: 'Sep 18', score: 75, title: 'JavaScript (ES6+) Core' },
    { date: 'Sep 25', score: 82, title: 'REST API Design' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>FINTECH-STYLE CAREER TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career Readiness & Velocity Analytics
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Multi-dimensional measurement of your skills, project proofs, assessment verifications, and study discipline.
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase font-mono transition ${
                timeRange === r
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 1. COMPOSITE READINESS INDEX SHOWCASE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-950/30 via-[#11131c] to-indigo-950/30 border border-violet-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Index Radial Big Number (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-violet-400">
              Career Readiness Index
            </span>
            <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent my-2">
              {readiness.overall_readiness}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Full Stack Engineering Benchmark
            </span>
          </div>

          {/* 4 Factor Weights Breakdown (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Skills Mastery (Weight 40%)</span>
                  <span className="font-mono font-bold text-white">{readiness.breakdown.skills}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${readiness.breakdown.skills}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Project Portfolio (Weight 25%)</span>
                  <span className="font-mono font-bold text-white">{readiness.breakdown.projects}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${readiness.breakdown.projects}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Assessment Scores (Weight 20%)</span>
                  <span className="font-mono font-bold text-white">{readiness.breakdown.assessments}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${readiness.breakdown.assessments}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Consistency & Streak (Weight 15%)</span>
                  <span className="font-mono font-bold text-white">{readiness.breakdown.consistency}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${readiness.breakdown.consistency}%` }} />
                </div>
              </div>
            </div>

            {/* Strongest Area & Focus Area Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-xs gap-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">Strongest Area:</span>
                <span className="text-slate-200">{readiness.strongest_area}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">Primary Focus Area:</span>
                <span className="text-slate-200">{readiness.focus_area}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explicit Transparency Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{readiness.disclaimer}</span>
        </div>
      </div>

      {/* 2. RADAR CHART & TIMELINE METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Proficiency Radar (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Fullstack Category Radar</h3>
            <span className="text-xs font-mono text-cyan-400">Current vs 85% Target</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" />
                <Radar name="Target" dataKey="target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.45} />
                <Tooltip contentStyle={{ backgroundColor: '#090a0f', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assessment Score Timeline (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Assessment Mastery History</h3>
            <span className="text-xs font-mono text-violet-400">Score % Timeline</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#090a0f', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
