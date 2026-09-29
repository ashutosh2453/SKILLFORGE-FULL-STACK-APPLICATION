import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Goal } from '../types';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Skill');
  const [targetDate, setTargetDate] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('Complete custom hooks, Pass assessment, Build demo project');

  const fetchGoals = async () => {
    try {
      const res = await api.getGoals();
      setGoals(res.goals || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleToggleMilestone = async (goalId: number, idx: number) => {
    try {
      await api.toggleGoalMilestone(goalId, idx);
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const milestones = milestonesInput.split(',').map(m => ({ title: m.trim(), completed: false })).filter(m => m.title);
      await api.createGoal({
        title,
        category,
        target_date: targetDate,
        milestones
      });
      setShowCreateModal(false);
      setTitle('');
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteGoal(id);
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold mb-1">
            <Target className="w-4 h-4" />
            <span>MILESTONE & DEADLINE TRACKER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Target Goals & Milestones
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Set deliberate deadlines for certifications, roadmaps, and projects to keep your career trajectory on schedule.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-violet-600/30"
        >
          <Plus className="w-4 h-4" /> New Career Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-6 rounded-3xl bg-[#11131c]/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold">
                  {goal.category}
                </span>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Due: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Upcoming'}</span>
                  <button onClick={() => handleDelete(goal.id)} className="text-slate-500 hover:text-rose-400 ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">{goal.title}</h3>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-mono font-bold text-white">{goal.progress_percent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" style={{ width: `${goal.progress_percent}%` }} />
                </div>
              </div>
            </div>

            {/* Sub Milestones Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Milestones:</span>
              {goal.milestones?.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleMilestone(goal.id, idx)}
                  className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center gap-2.5 text-xs transition"
                >
                  <CheckCircle2 className={`w-4 h-4 ${m.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                    {m.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#11131c] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Create New Goal</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Goal Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Master React & Node.js by Dec 15"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Skill">Skill Mastery</option>
                    <option value="Roadmap">Roadmap Phase</option>
                    <option value="Project">Portfolio Project</option>
                    <option value="Career">Job Applications</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Sub-Milestones (comma separated)</label>
                <textarea
                  rows={2}
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
