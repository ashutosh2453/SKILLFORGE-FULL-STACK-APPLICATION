import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Filter,
  Zap,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { GapAnalysisData, Skill } from '../types';

export const SkillsPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'matrix' | 'gap'>('gap');
  const [categoriesMap, setCategoriesMap] = useState<Record<string, any[]>>({});
  const [gapData, setGapData] = useState<GapAnalysisData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matrixRes, gapRes] = await Promise.all([
          api.getSkillMatrix(),
          api.getGapAnalysis()
        ]);
        setCategoriesMap(matrixRes.categories || {});
        setGapData(gapRes.gap_analysis);
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = Object.keys(categoriesMap);

  const filteredGapSkills = gapData?.skills?.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.skill_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>SKILL MATRIX & GAP ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skill Intelligence & Gap Analysis
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Audit your technical competencies against the <span className="text-violet-300 font-semibold">{gapData?.career_title || 'Full Stack Developer'}</span> industry baseline.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0 text-xs">
          <button
            onClick={() => setActiveView('gap')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeView === 'gap'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Skill Gap Audit
          </button>
          <button
            onClick={() => setActiveView('matrix')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeView === 'matrix'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Full Matrix
          </button>
        </div>
      </div>

      {/* GAP AUDIT SUMMARY HERO */}
      {activeView === 'gap' && gapData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Role Match</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {gapData.overall_proficiency_pct}%
              </span>
              <span className="text-xs text-slate-500">Benchmark</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${gapData.overall_proficiency_pct}%` }} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300">Critical Gaps (≥40%)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold font-mono text-rose-400">
                {gapData.critical_count}
              </span>
              <span className="text-xs text-rose-300/70">Urgent Focus</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">High-impact skills below acceptable benchmark</p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Moderate Gaps (15-39%)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                {gapData.moderate_count}
              </span>
              <span className="text-xs text-amber-300/70">In Progress</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Near target proficiency threshold</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">Strong / Verified</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                {gapData.strong_count}
              </span>
              <span className="text-xs text-emerald-300/70">Mastered</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Exceeds target benchmark requirements</p>
          </div>
        </div>
      )}

      {/* Toolbar: Category Filters + Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {['Frontend', 'Backend', 'Database', 'DevOps', 'Programming', 'System Design', 'Soft Skills'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* VIEW 1: SKILL GAP AUDIT (Connected dual bars & gap labels) */}
      {activeView === 'gap' && (
        <div className="rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
            <span>Skill & Classification</span>
            <div className="flex items-center gap-8 pr-4">
              <span className="w-48 text-left hidden sm:inline-block">Current vs Target Benchmark</span>
              <span className="w-24 text-right">Gap Status</span>
              <span className="w-20 text-right">Action</span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredGapSkills.map((s) => (
              <div
                key={s.skill_id}
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                {/* Skill Name & Info */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-violet-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{s.skill_name}</h4>
                      {s.verified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{s.category} • Importance: {s.importance}</span>
                  </div>
                </div>

                {/* Connected Dual Bar Representation */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="w-full sm:w-48">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-300">Current: <b className="text-white">{s.current_level}%</b></span>
                      <span className="text-slate-400">Target: <b className="text-violet-400">{s.target_level}%</b></span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 relative overflow-hidden">
                      {/* Current level fill */}
                      <div
                        className={`h-full rounded-full ${
                          s.gap_category === 'Critical Gap'
                            ? 'bg-rose-500'
                            : s.gap_category === 'Moderate Gap'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${s.current_level}%` }}
                      />
                    </div>
                  </div>

                  {/* Gap Badge */}
                  <div className="w-24 text-right">
                    <span
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border font-bold ${
                        s.gap_category === 'Critical Gap'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : s.gap_category === 'Moderate Gap'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {s.gap > 0 ? `-${s.gap}% Gap` : 'Mastered'}
                    </span>
                  </div>

                  {/* Action Link */}
                  <div className="w-20 text-right">
                    <NavLink
                      to={`/skills/${s.skill_id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-300 text-[11px] font-semibold transition"
                    >
                      Study →
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: FULL SKILL MATRIX GRID */}
      {activeView === 'matrix' && (
        <div className="space-y-6">
          {categories
            .filter(cat => selectedCategory === 'all' || cat === selectedCategory)
            .map((cat) => (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-white">{cat}</h3>
                  <span className="text-xs font-mono text-slate-500">
                    ({categoriesMap[cat]?.length || 0} competencies)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesMap[cat]?.map((s: any) => (
                    <NavLink
                      key={s.skill_id}
                      to={`/skills/${s.skill_id}`}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {s.level_label}
                          </span>
                          {s.verified ? (
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Unverified</span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-white group-hover:text-violet-300 transition">
                          {s.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Score: <b className="text-white font-mono">{s.assessment_score}%</b>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{s.current_proficiency}%</span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${s.current_proficiency}%` }} />
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
