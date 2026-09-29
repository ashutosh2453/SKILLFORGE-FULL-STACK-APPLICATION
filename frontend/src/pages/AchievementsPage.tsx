import React, { useState, useEffect } from 'react';
import { Award, Sparkles, Flame, Rocket, Crown, Zap, MessageSquare, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../types';

export const AchievementsPage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedPoints, setUnlockedPoints] = useState(0);

  useEffect(() => {
    api.getAchievements().then(res => {
      setBadges(res.achievements || []);
      setTotalPoints(res.total_points || 0);
      setUnlockedPoints(res.unlocked_points || 0);
    }).catch(console.error);
  }, []);

  const badgeIcons: Record<string, any> = {
    Sparkles, Flame, Rocket, Award, Crown, Zap, MessageSquare
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold mb-1">
            <Award className="w-4 h-4" />
            <span>PROOF OF WORK BADGES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineering Achievements
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Verifiable milestone badges unlocked through real coding assessments, portfolio deployments, and unbroken learning streaks.
          </p>
        </div>

        {/* Total Points Indicator */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0 text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Forge Points</span>
          <span className="text-2xl font-black font-mono text-amber-400">
            {unlockedPoints} <span className="text-xs text-slate-500 font-normal">/ {totalPoints} XP</span>
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {badges.map((b) => {
          const Icon = badgeIcons[b.icon] || Award;
          return (
            <div
              key={b.id}
              className={`p-6 rounded-3xl border transition flex flex-col items-center text-center justify-between relative overflow-hidden backdrop-blur-xl ${
                b.unlocked
                  ? 'bg-gradient-to-b from-[#161926] to-[#11131c] border-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              {/* Unlock Indicator */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono mb-4">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {b.category}
                </span>
                <span className="font-bold text-amber-400">+{b.points} XP</span>
              </div>

              {/* Glowing Icon Emblem */}
              <div className={`w-20 h-20 rounded-3xl p-0.5 mb-4 flex items-center justify-center ${
                b.unlocked
                  ? 'bg-gradient-to-tr from-amber-500 via-violet-500 to-cyan-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800'
              }`}>
                <div className="w-full h-full bg-[#0d0f17] rounded-[22px] flex items-center justify-center">
                  <Icon className={`w-8 h-8 ${b.unlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 w-full text-center">
                {b.unlocked ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-500 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
