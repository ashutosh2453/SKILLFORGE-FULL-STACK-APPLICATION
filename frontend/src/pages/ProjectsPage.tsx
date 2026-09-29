import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Clock,
  GitCommit,
  Sparkles,
  Layers,
  Code2,
  Trash2,
  Edit3
} from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubSync, setGithubSync] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New project state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [status, setStatus] = useState('Building');
  const [techInput, setTechInput] = useState('React, TypeScript, Tailwind CSS, Node.js');

  const fetchProjects = async () => {
    try {
      const [projRes, gitRes] = await Promise.all([
        api.getProjects(),
        api.getGithubSync()
      ]);
      setProjects(projRes.projects || []);
      setGithubSync(gitRes.github);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleMilestone = async (projectId: number, milestoneId: number) => {
    try {
      await api.toggleMilestone(projectId, milestoneId);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const techList = techInput.split(',').map(t => t.trim()).filter(Boolean);
      await api.createProject({
        title,
        description,
        difficulty,
        github_url: githubUrl,
        live_url: liveUrl,
        status,
        technologies: techList,
        milestones: [
          'Design system & responsive layout',
          'API authentication & core endpoints',
          'Database migrations & index tuning',
          'Integration testing & CI/CD pipeline'
        ]
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      fetchProjects();
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
            <FolderGit2 className="w-4 h-4" />
            <span>PORTFOLIO FORGE & GITHUB TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portfolio Projects & Milestones
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Where skills become tangible production software. Track milestones, link live deployments, and synchronize commit activity.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-violet-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Portfolio Project
        </button>
      </div>

      {/* GitHub Sync Status Card */}
      {githubSync && (
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-800 text-white shrink-0">
              <GitBranch className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">GitHub Integration Active</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                  {githubSync.mode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected account: <span className="text-slate-200 font-mono">@{githubSync.username}</span> • {githubSync.total_contributions_this_year} contributions this year
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {githubSync.languages?.map((lang: any) => (
              <div key={lang.name} className="flex items-center gap-1.5 font-mono">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="text-slate-300">{lang.name} ({lang.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects List with Milestones */}
      <div className="space-y-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 sm:p-8 rounded-3xl bg-[#11131c]/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6"
          >
            {/* Top Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    proj.status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : proj.status === 'Building'
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {proj.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">• {proj.difficulty}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{proj.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Progress and Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-500 block">Progress</span>
                  <span className="text-xl font-bold font-mono text-white">{proj.progress_percent}%</span>
                </div>

                <div className="flex items-center gap-2">
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-white text-slate-400 transition"
                      title="GitHub Repository"
                    >
                      <GitBranch className="w-4 h-4" />
                    </a>
                  )}
                  {proj.live_url && (
                    <a
                      href={proj.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-white text-slate-400 transition"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-rose-400 text-slate-500 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {proj.technologies?.map((tech, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  {tech}
                </span>
              ))}
            </div>

            {/* Milestones Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Project Milestones & Verification ({proj.milestones?.filter(m => m.completed).length}/{proj.milestones?.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {proj.milestones?.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(proj.id, m.id)}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 ${m.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {m.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#11131c] border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Create Portfolio Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Task Queue & Telemetry"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key architectural capabilities and problems solved..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Capstone">Capstone</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Planning">Planning</option>
                    <option value="Building">Building</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Live Deployment URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
