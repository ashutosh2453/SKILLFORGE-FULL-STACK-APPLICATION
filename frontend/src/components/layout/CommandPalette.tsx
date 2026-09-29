import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Layers,
  GitMerge,
  BookOpen,
  FolderGit2,
  CheckSquare,
  BarChart3,
  Flame,
  PlusCircle,
  Command,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { Skill, Resource, Project } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      api.getSkills().then(res => setSkills(res.skills || [])).catch(() => {});
      api.getResources().then(res => setResources(res.resources || [])).catch(() => {});
      api.getProjects().then(res => setProjects(res.projects || [])).catch(() => {});
    }
  }, [isOpen]);

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.type.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const quickActions = [
    { label: 'Start Verified Assessment', icon: CheckSquare, action: () => { navigate('/assessments'); onClose(); } },
    { label: 'View Personalized Roadmap Graph', icon: GitMerge, action: () => { navigate('/roadmap'); onClose(); } },
    { label: 'Analyze Skill Gaps', icon: Layers, action: () => { navigate('/skills'); onClose(); } },
    { label: 'Log 30m Learning Session', icon: Flame, action: () => { navigate('/learning'); onClose(); } },
    { label: 'Create New Portfolio Project', icon: PlusCircle, action: () => { navigate('/projects'); onClose(); } },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (action: () => void) => {
    action();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-2xl bg-[#0f111a] border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden text-slate-200"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search skills, roadmaps, resources, projects, or commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 block mb-1">
                    Commands
                  </span>
                  <div className="space-y-1">
                    {quickActions.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(item.action)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-violet-600/15 hover:text-violet-300 text-slate-300 transition text-left group"
                        >
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-violet-400" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skills */}
              {filteredSkills.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 block mb-1">
                    Skills
                  </span>
                  <div className="space-y-1">
                    {filteredSkills.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { navigate(`/skills/${s.id}`); onClose(); }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/70 text-slate-300 transition text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium text-slate-200 group-hover:text-white">{s.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {s.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {filteredResources.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 block mb-1">
                    Curated Resources
                  </span>
                  <div className="space-y-1">
                    {filteredResources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={onClose}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/70 text-slate-300 transition text-left group"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <BookOpen className="w-4 h-4 text-violet-400 shrink-0" />
                          <span className="truncate group-hover:text-white">{r.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-2">{r.type}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 block mb-1">
                    Projects
                  </span>
                  <div className="space-y-1">
                    {filteredProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { navigate('/projects'); onClose(); }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/70 text-slate-300 transition text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <FolderGit2 className="w-4 h-4 text-emerald-400" />
                          <span className="group-hover:text-white">{p.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{p.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span>Navigate <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">↑↓</kbd></span>
                <span>Select <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">↵</kbd></span>
              </div>
              <span>Close <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">ESC</kbd></span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
