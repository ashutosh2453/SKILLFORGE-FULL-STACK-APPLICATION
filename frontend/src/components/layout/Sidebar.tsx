import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GitMerge,
  Layers,
  CheckSquare,
  BookOpen,
  FolderGit2,
  BarChart3,
  Target,
  MessageSquare,
  Users2,
  Award,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuthStore();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/roadmap', label: 'My Roadmap', icon: GitMerge, badge: 'Active' },
    { to: '/skills', label: 'Skills & Gaps', icon: Layers },
    { to: '/assessments', label: 'Assessments', icon: CheckSquare },
    { to: '/learning', label: 'Learning Library', icon: BookOpen },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/community', label: 'Community', icon: MessageSquare },
    { to: '/mentors', label: 'Mentors', icon: Users2 },
    { to: '/achievements', label: 'Achievements', icon: Award },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin Control', icon: ShieldAlert, badge: 'Admin' });
  }

  return (
    <motion.aside
      className={`hidden md:flex flex-col bg-[#0d0f17]/95 border-r border-slate-800/80 backdrop-blur-xl h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      animate={{ width: collapsed ? 80 : 256 }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shrink-0 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                SkillForge
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Forge your career</span>
            </motion.div>
          )}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm shadow-violet-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0 group-hover:text-violet-400 transition" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition group overflow-hidden"
        >
          <img
            src={user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border border-violet-500/30 shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-violet-300">
                {user?.profile?.full_name || user?.username || 'Ashutosh'}
              </span>
              <span className="text-[11px] text-slate-500 capitalize truncate">
                {user?.role || 'Student'} • {user?.profile?.target_career?.title || 'Full Stack'}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </motion.aside>
  );
};
