import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  BookOpen,
  CheckSquare,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Clock,
  Award,
  Zap,
  Play
} from 'lucide-react';
import { api } from '../services/api';
import { Skill, Resource, Assessment } from '../types';

export const SkillDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [skill, setSkill] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchSkillData = async () => {
      try {
        const res = await api.getSkillDetail(parseInt(id));
        setSkill(res.skill);
        
        // Fetch AI Explanation for this skill
        const aiRes = await api.getAiExplanation(res.skill.name);
        setAiExplanation(aiRes.explanation);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkillData();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading skill intelligence...</div>;
  }

  if (!skill) {
    return <div className="p-8 text-center text-slate-400">Skill not found</div>;
  }

  const userProf = skill.user_proficiency || { current_proficiency: 0, verified: false, assessment_score: 0, level_label: 'Novice' };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <NavLink
        to="/skills"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Skills & Gaps
      </NavLink>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11131c]/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold mb-1">
            <span>{skill.category}</span>
            <span>•</span>
            <span>COMPETENCY DEEP-DIVE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {skill.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            {skill.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {skill.tags?.map((tag: string, idx: number) => (
              <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Current Proficiency Card */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 w-full sm:w-64 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Your Proficiency</span>
            {userProf.verified && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-white">{userProf.current_proficiency}%</span>
            <span className="text-xs text-slate-400 capitalize">({userProf.level_label})</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" style={{ width: `${userProf.current_proficiency}%` }} />
          </div>
        </div>
      </div>

      {/* AI Study Guidance & Mental Models */}
      {aiExplanation && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/20 via-[#11131c]/90 to-cyan-950/10 border border-violet-500/30 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-base text-white">SkillForge Architectural Study Blueprint</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {aiExplanation.industry_context}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="font-bold text-violet-300 block mb-2">Key Mental Models:</span>
              <ul className="space-y-1.5 text-slate-300">
                {aiExplanation.key_mental_models?.map((m: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="font-bold text-cyan-300 block mb-2">Recommended Study Sequence:</span>
              <ul className="space-y-1.5 text-slate-300">
                {aiExplanation.recommended_study_sequence?.map((seq: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{seq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Curated Resources Section */}
      <div className="rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white">Curated Learning Resources</h3>
          </div>
          <NavLink
            to={`/learning?skill_id=${skill.id}`}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Open in Learning Library →
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skill.resources?.map((r: Resource) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{r.type}</span>
                  <span>{r.difficulty}</span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-violet-300 transition line-clamp-2">
                  {r.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {r.duration_mins}m</span>
                <span className="text-violet-400 group-hover:translate-x-1 transition flex items-center gap-1 font-medium">
                  Launch <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
