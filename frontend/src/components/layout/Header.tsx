import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  CheckCheck,
  Flame,
  Clock,
  Sparkles,
  Shield,
  GraduationCap,
  Users
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Notification } from '../../types';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  const { user, logout, theme, toggleTheme, demoLogin } = useAuthStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationsData, setNotificationsData] = useState<{ today: Notification[]; earlier: Notification[]; unread_count: number }>({
    today: [],
    earlier: [],
    unread_count: 0
  });

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotificationsData(res);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSwitch = async (role: 'student' | 'mentor' | 'admin') => {
    try {
      await demoLogin(role);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
      setShowProfileMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-[#090a0f]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Search / Command Palette Bar */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 text-slate-400 hover:text-slate-200 transition text-sm w-64 md:w-80 shadow-inner group text-left"
      >
        <Search className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition" />
        <span className="flex-1 truncate">Search skills, roadmaps...</span>
        <kbd className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
          Ctrl K
        </kbd>
      </button>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Role Quick Switcher Pills */}
        <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => handleRoleSwitch('student')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'student'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student
          </button>
          <button
            onClick={() => handleRoleSwitch('mentor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'mentor'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Mentor
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'admin'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Streak Counter */}
        {user?.profile && (
          <NavLink
            to="/learning"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold font-mono-code hover:bg-amber-500/20 transition"
            title="Current Learning Streak"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{user.profile.current_streak}d</span>
          </NavLink>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationsData.unread_count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#090a0f]">
                {notificationsData.unread_count}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#11131c] border border-slate-800 rounded-2xl shadow-2xl z-40 p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  Notifications
                  {notificationsData.unread_count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono">
                      {notificationsData.unread_count} new
                    </span>
                  )}
                </span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3">
                {notificationsData.today.length === 0 && notificationsData.earlier.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  <>
                    {notificationsData.today.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                          Today
                        </span>
                        <div className="space-y-2">
                          {notificationsData.today.map((n) => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-xl border text-xs transition ${
                                n.read
                                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                                  : 'bg-violet-950/20 border-violet-500/30 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                                <span>{n.title}</span>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                                )}
                              </div>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {notificationsData.earlier.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                          Earlier
                        </span>
                        <div className="space-y-2">
                          {notificationsData.earlier.map((n) => (
                            <div
                              key={n.id}
                              className="p-2.5 rounded-xl border bg-slate-900/40 border-slate-800/60 text-xs text-slate-400"
                            >
                              <div className="font-semibold text-slate-300 mb-1">{n.title}</div>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition"
          >
            <img
              src={user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-violet-500/40"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#11131c] border border-slate-800 rounded-2xl shadow-2xl z-40 p-2 text-xs">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <span className="font-bold text-white block">{user?.profile?.full_name || user?.username}</span>
                <span className="text-slate-500 capitalize">{user?.role}</span>
              </div>

              <NavLink
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <UserIcon className="w-4 h-4 text-violet-400" />
                Profile & Goals
              </NavLink>

              <div className="my-1 border-t border-slate-800" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
