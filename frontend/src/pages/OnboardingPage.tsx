import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Layers,
  Cpu,
  Server,
  Layout,
  Cloud,
  BarChart3,
  Database,
  ShieldCheck,
  Smartphone,
  GitMerge,
  Clock,
  BookOpen,
  FolderGit2,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Career, Skill } from '../types';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [timeInvest, setTimeInvest] = useState<number>(10);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [learningStyle, setLearningStyle] = useState<'videos' | 'reading' | 'projects' | 'practice' | 'mixed'>('mixed');
  const [isForging, setIsForging] = useState(false);
  
  const { user, login, demoLogin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.getCareers().then(res => {
      setCareers(res.careers || []);
      if (res.careers?.length > 0) {
        setSelectedCareer(res.careers[0]);
      }
    }).catch(console.error);

    api.getSkills().then(res => {
      setSkills(res.skills || []);
    }).catch(console.error);
  }, []);

  const toggleSkill = (id: number) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsForging(true);
    try {
      if (!user) {
        await demoLogin('student');
      }

      await api.completeOnboarding({
        target_career_id: selectedCareer?.id,
        known_skills: selectedSkills,
        experience_level: experience,
        learning_style: learningStyle,
        hours_per_week: timeInvest
      });

      // Animated pause for visual prestige
      setTimeout(() => {
        setIsForging(false);
        navigate('/dashboard');
      }, 2200);
    } catch (err) {
      console.error(err);
      setIsForging(false);
      navigate('/dashboard');
    }
  };

  const careerIcons: Record<string, any> = {
    Layers, Cpu, Server, Layout, Cloud, BarChart3, Database, ShieldCheck, Smartphone, GitMerge
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden bg-radial-glow bg-grid-pattern">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5">
            <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">SkillForge Setup</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-violet-500' : step > i ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'
              }`}
            />
          ))}
          <span className="text-xs font-mono text-slate-400 ml-2">Step {step}/5</span>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="max-w-4xl mx-auto w-full py-8 my-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: CAREER GOAL */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">Step 1 of 5</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                  What is your target engineering destination?
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Select the role you want to conquer. We will generate your benchmark requirements against real industry standards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto p-1">
                {careers.map((c) => {
                  const Icon = careerIcons[c.icon] || Code2;
                  const isSelected = selectedCareer?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCareer(c)}
                      className={`p-4 rounded-2xl border cursor-pointer transition text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-violet-950/30 border-violet-500/80 shadow-lg shadow-violet-500/10'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-violet-400" />}
                        </div>
                        <h4 className="font-bold text-sm text-white">{c.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60">
                        <span>{c.average_salary}</span>
                        <span>{c.difficulty}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: KNOWN SKILLS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">Step 2 of 5</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                  What skills do you already have some experience in?
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Click any technologies you have built with or learned before. Don't worry—you can verify mastery later with assessments.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[45vh] overflow-y-auto p-2">
                {skills.map((s) => {
                  const isChecked = selectedSkills.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSkill(s.id)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition flex items-center gap-2 ${
                        isChecked
                          ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/20'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span>{s.name}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: TIME INVESTMENT */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 max-w-xl mx-auto text-center"
            >
              <div>
                <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">Step 3 of 5</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                  How much weekly time can you commit?
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  We dynamically calibrate your weekly milestone targets and pacing accordingly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { hours: 5, label: 'Casual', desc: '5 hrs / week (~45 min/day)' },
                  { hours: 10, label: 'Focused', desc: '10 hrs / week (~1.5 hrs/day)' },
                  { hours: 15, label: 'Intensive', desc: '15 hrs / week (~2 hrs/day)' },
                  { hours: 25, label: 'Full Immersion', desc: '25+ hrs / week (Bootcamp pace)' }
                ].map((item) => (
                  <div
                    key={item.hours}
                    onClick={() => setTimeInvest(item.hours)}
                    className={`p-5 rounded-2xl border cursor-pointer transition text-left ${
                      timeInvest === item.hours
                        ? 'bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-500/15'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{item.hours} hrs</span>
                      {timeInvest === item.hours && <CheckCircle2 className="w-5 h-5 text-violet-400" />}
                    </div>
                    <span className="text-xs font-semibold text-violet-300 block mt-1">{item.label}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: EXPERIENCE LEVEL */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 max-w-xl mx-auto text-center"
            >
              <div>
                <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">Step 4 of 5</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                  What is your current overall background?
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Sets initial baseline proficiency assumptions for foundational roadmap nodes.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { level: 'beginner', title: 'Complete Beginner', desc: 'New to programming or transitioning from a non-technical background.' },
                  { level: 'intermediate', title: 'Intermediate / Student', desc: 'Familiar with basic syntax and CS concepts; looking to ship production-level fullstack systems.' },
                  { level: 'advanced', title: 'Experienced Engineer', desc: 'Working professional looking to upskill into distributed systems, AI/ML, or Tier-1 architecture.' }
                ].map((item) => (
                  <div
                    key={item.level}
                    onClick={() => setExperience(item.level as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left flex items-center justify-between ${
                      experience === item.level
                        ? 'bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-500/15'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    {experience === item.level && <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 ml-4" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: LEARNING STYLE */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 max-w-xl mx-auto text-center"
            >
              <div>
                <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">Step 5 of 5</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                  How do you prefer to absorb and master skills?
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Customizes resource recommendations (video courses, official docs, hands-on repositories, or challenges).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { style: 'mixed', label: 'Balanced / Mixed', icon: Sparkles, desc: 'Curated mix of docs, videos, and repo projects' },
                  { style: 'projects', label: 'Project-First', icon: FolderGit2, desc: 'Learn by building concrete GitHub portfolio repos' },
                  { style: 'videos', label: 'Video Tutorials', icon: BookOpen, desc: 'Visual video deep dives and masterclasses' },
                  { style: 'practice', label: 'Hands-on Practice', icon: Zap, desc: 'Interactive coding sandboxes and assessments' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.style}
                      onClick={() => setLearningStyle(item.style as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition text-left ${
                        learningStyle === item.style
                          ? 'bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-500/15'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-violet-400 mb-2" />
                      <h4 className="font-bold text-sm text-white">{item.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Footer Controls */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pt-6 border-t border-slate-800">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-violet-600/30"
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold flex items-center gap-2 transition shadow-xl shadow-violet-600/30"
          >
            Forge My Roadmap <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Forging Animation Overlay */}
      <AnimatePresence>
        {isForging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#090a0f]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-violet-500/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-cyan-500/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <Sparkles className="w-12 h-12 text-violet-400 animate-pulse" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Forging your personalized roadmap...
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">
              Analyzing skill gaps • Synthesizing prerequisite DAG graph • Initializing milestones
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
