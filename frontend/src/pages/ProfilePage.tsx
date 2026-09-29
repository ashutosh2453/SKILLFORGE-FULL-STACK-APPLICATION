import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Shield, GitMerge, Clock, Flame, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Career } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const [careers, setCareers] = useState<Career[]>([]);
  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [targetCareerId, setTargetCareerId] = useState<number | undefined>(user?.profile?.target_career_id);
  const [hoursPerWeek, setHoursPerWeek] = useState(user?.profile?.hours_per_week || 10);
  const [learningStyle, setLearningStyle] = useState(user?.profile?.learning_style || 'mixed');
  const [githubUsername, setGithubUsername] = useState(user?.profile?.github_username || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getCareers().then(res => setCareers(res.careers || [])).catch(console.error);
    if (user?.profile) {
      setFullName(user.profile.full_name || '');
      setHeadline(user.profile.headline || '');
      setBio(user.profile.bio || '');
      setTargetCareerId(user.profile.target_career_id);
      setHoursPerWeek(user.profile.hours_per_week || 10);
      setLearningStyle(user.profile.learning_style || 'mixed');
      setGithubUsername(user.profile.github_username || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        full_name: fullName,
        headline,
        bio,
        target_career_id: targetCareerId,
        hours_per_week: hoursPerWeek,
        learning_style: learningStyle,
        github_username: githubUsername
      });
      setSavedSuccess(true);
      fetchUser();
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <img
            src={user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Profile Avatar"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {user?.profile?.full_name || user?.username}
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                {user?.role}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">@{user?.username} • {user?.email}</p>
          </div>
        </div>

        {savedSuccess && (
          <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Profile Updated!
          </span>
        )}
      </div>

      {/* Form Settings Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11131c]/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Target Career Goal</label>
              <select
                value={targetCareerId}
                onChange={(e) => setTargetCareerId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Weekly Study Bandwidth</label>
              <input
                type="number"
                min="2"
                max="80"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">GitHub Username</label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
            >
              <Save className="w-4 h-4" /> Save Profile Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
