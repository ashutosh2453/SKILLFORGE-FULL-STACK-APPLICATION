import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Layers, BookOpen, CheckSquare, FolderGit2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  
  // New Skill State
  const [skillName, setSkillName] = useState('');
  const [skillCat, setSkillCat] = useState('Frontend');
  const [skillDesc, setSkillDesc] = useState('');

  // New Resource State
  const [resSkillId, setResSkillId] = useState<number | undefined>();
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState('Article');

  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, skillsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers(),
        api.getSkills()
      ]);
      setStats(statsRes.stats);
      setUsersList(usersRes.users || []);
      setSkillsList(skillsRes.skills || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await api.updateUserRole(userId, role);
      setMessage(`Updated user #${userId} role to ${role}`);
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateSkill({ name: skillName, category: skillCat, description: skillDesc });
      setSkillName('');
      setSkillDesc('');
      setMessage(`Skill "${skillName}" created successfully!`);
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm('Are you sure? This will delete the skill.')) return;
    try {
      await api.adminDeleteSkill(id);
      setMessage('Skill deleted.');
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resSkillId) return;
    try {
      await api.adminCreateResource({
        skill_id: resSkillId,
        title: resTitle,
        url: resUrl,
        type: resType
      });
      setResTitle('');
      setResUrl('');
      setMessage('Resource created successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center text-slate-400">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 mt-1">Switch to the Admin demo account in the top right to access this panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>ROLE-BASED ACCESS CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin System Control Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Platform-wide user management, skill catalog maintenance, and curriculum administration.
          </p>
        </div>

        {message && (
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ✓ {message}
          </span>
        )}
      </div>

      {/* Platform Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Users', val: stats.total_users, icon: Users },
            { label: 'Careers', val: stats.total_careers, icon: FolderGit2 },
            { label: 'Skills', val: stats.total_skills, icon: Layers },
            { label: 'Roadmaps', val: stats.total_roadmaps, icon: ShieldAlert },
            { label: 'Resources', val: stats.total_resources, icon: BookOpen },
            { label: 'Assessments', val: stats.total_assessments, icon: CheckSquare },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">{item.label}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className="w-4 h-4 text-violet-400" />
                  <span className="text-xl font-bold font-mono text-white">{item.val}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Management Table */}
      <div className="p-6 rounded-3xl bg-[#11131c]/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
        <h3 className="font-bold text-base text-white">Registered Users & Role Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase font-mono text-slate-500 border-b border-slate-800">
              <tr>
                <th className="pb-2">User</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 font-bold text-white">@{u.username}</td>
                  <td className="py-2.5 text-slate-400">{u.email}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                      u.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : u.role === 'mentor' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-violet-500/20 text-violet-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill & Resource Management Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Skill */}
        <div className="p-6 rounded-3xl bg-[#11131c]/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
          <h3 className="font-bold text-base text-white">Create Competency Skill</h3>
          <form onSubmit={handleCreateSkill} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Skill Name</label>
              <input
                type="text"
                placeholder="e.g. Distributed Tracing & OpenTelemetry"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select
                value={skillCat}
                onChange={(e) => setSkillCat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="AI/ML">AI/ML</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Learning objectives and core patterns..."
                value={skillDesc}
                onChange={(e) => setSkillDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition"
            >
              Add Skill to Catalog
            </button>
          </form>
        </div>

        {/* Add Resource */}
        <div className="p-6 rounded-3xl bg-[#11131c]/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
          <h3 className="font-bold text-base text-white">Add Curated Resource</h3>
          <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Skill</label>
              <select
                value={resSkillId}
                onChange={(e) => setResSkillId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              >
                <option value="">Select skill...</option>
                {skillsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Resource Title</label>
              <input
                type="text"
                placeholder="e.g. Distributed Tracing RFC & Implementation"
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Resource URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Type</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Documentation">Documentation</option>
                  <option value="Video">Video</option>
                  <option value="Article">Article</option>
                  <option value="Practice">Practice</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition"
            >
              Add Resource
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
