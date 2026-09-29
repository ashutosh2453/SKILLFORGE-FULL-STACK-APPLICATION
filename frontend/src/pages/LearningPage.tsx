import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  ExternalLink,
  Flame,
  Plus,
  Play,
  Bookmark,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { Resource, Skill, LearningSession } from '../types';

export const LearningPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSkillId = searchParams.get('skill_id');

  const [resources, setResources] = useState<Resource[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [weeklyChart, setWeeklyChart] = useState<any[]>([]);
  
  // Filters
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSkillId || 'all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Log session state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSkillId, setLogSkillId] = useState<number | undefined>();
  const [logMinutes, setLogMinutes] = useState<number>(30);
  const [logNotes, setLogNotes] = useState<string>('');

  const fetchData = async () => {
    try {
      const [resData, skillsData, sessionsData, chartData] = await Promise.all([
        api.getResources({
          skill_id: selectedSkill !== 'all' ? parseInt(selectedSkill) : undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
          difficulty: selectedDiff !== 'all' ? selectedDiff : undefined,
          search: searchQuery || undefined
        }),
        api.getSkills(),
        api.getLearningSessions(),
        api.getWeeklyLearningChart()
      ]);
      setResources(resData.resources || []);
      setSkills(skillsData.skills || []);
      setSessions(sessionsData.sessions || []);
      setWeeklyChart(chartData.weekly_chart || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSkill, selectedType, selectedDiff, searchQuery]);

  const handleUpdateStatus = async (resourceId: number, status: string) => {
    try {
      await api.updateResourceStatus(resourceId, status);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logLearningSession({
        skill_id: logSkillId,
        duration_minutes: logMinutes,
        notes: logNotes
      });
      setShowLogModal(false);
      setLogNotes('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>LEARNING VAULT & TIME LOGGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curated Learning & Practice Library
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            High-signal documentation, interactive practice sandboxes, and architectural articles. Log minutes studied to power your consistency streak.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-violet-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Study Session
        </button>
      </div>

      {/* WEEKLY STUDY GRAPH & RECENT SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Study Hours Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              <h3 className="font-bold text-sm text-white">Weekly Study Distribution</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Past 7 Days (Minutes)</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090a0f', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} min (${(Number(value) / 60).toFixed(1)}h)`, 'Studied']}
                />
                <Bar dataKey="minutes" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Session Logs (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Recent Study Sessions
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">{sessions.length} logged</span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {sessions.slice(0, 4).map((s) => (
                <div key={s.id} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">{s.skill_name || 'General Study'}</span>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{s.notes || 'Focused review and coding exercise'}</p>
                  </div>
                  <span className="font-mono font-bold text-violet-400 px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                    +{s.duration_minutes}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Skills</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Types</option>
            <option value="Documentation">Documentation</option>
            <option value="Video">Video</option>
            <option value="Article">Article</option>
            <option value="Practice">Practice</option>
            <option value="Course">Course</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDiff}
            onChange={(e) => setSelectedDiff(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r) => (
          <div
            key={r.id}
            className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
              r.is_completed
                ? 'bg-slate-950/40 border-emerald-500/30 opacity-80'
                : 'bg-[#11131c]/80 border-slate-800 hover:border-violet-500/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{r.type}</span>
                <span className="text-slate-500">{r.difficulty} • {r.duration_mins}m</span>
              </div>

              <h4 className="font-bold text-sm text-white hover:text-violet-300 transition line-clamp-2">
                {r.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>
              <span className="text-[11px] text-slate-500 font-mono mt-2 block">By {r.provider}</span>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => handleUpdateStatus(r.id, r.is_completed ? 'in_progress' : 'completed')}
                className={`flex items-center gap-1 font-semibold transition ${
                  r.is_completed ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {r.is_completed ? 'Completed' : 'Mark Done'}
              </button>

              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition flex items-center gap-1.5"
              >
                Launch <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Log Session Modal Dialog */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#11131c] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Log Learning Session</h3>
            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Skill Practiced</label>
                <select
                  value={logSkillId}
                  onChange={(e) => setLogSkillId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">General Study</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Session Notes</label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="What concepts or bug fixes did you work through?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
