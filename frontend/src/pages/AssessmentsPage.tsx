import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Code2
} from 'lucide-react';
import { api } from '../services/api';
import { Assessment, Question } from '../types';

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 mins
  const [isTestActive, setIsTestActive] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssessments = async () => {
    try {
      const res = await api.getAssessments();
      setAssessments(res.assessments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isTestActive || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTestActive, timeLeftSeconds]);

  const handleStartAssessment = async (assessmentId: number) => {
    try {
      const res = await api.getAssessment(assessmentId);
      setActiveAssessment(res.assessment);
      setSelectedAnswers({});
      setFlaggedQuestions([]);
      setCurrentQuestionIdx(0);
      setTimeLeftSeconds((res.assessment.time_limit_mins || 15) * 60);
      setTestResult(null);
      setIsTestActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOption = (questionId: number, option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev =>
      prev.includes(questionId) ? prev.filter(q => q !== questionId) : [...prev, questionId]
    );
  };

  const handleSubmitAssessment = async () => {
    if (!activeAssessment) return;
    try {
      const res = await api.submitAssessment(activeAssessment.id, selectedAnswers);
      setTestResult(res.result);
      setIsTestActive(false);
      fetchAssessments();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ: Question | undefined = activeAssessment?.questions?.[currentQuestionIdx];

  return (
    <div className="space-y-6">
      {/* 1. QUIZ DASHBOARD (When not actively taking test) */}
      {!isTestActive && !testResult && (
        <>
          <div className="p-6 sm:p-8 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold mb-1">
                <CheckSquare className="w-4 h-4" />
                <span>SKILL VERIFICATION ENGINE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Verified Skill Assessments
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Prove your competencies with timed coding output checks and architecture questions. Passing updates your verified proficiency and unlocks achievement badges.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 hover:border-violet-500/50 transition backdrop-blur-xl shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {a.difficulty}
                    </span>
                    {a.has_attempted ? (
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        a.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        Score: {a.latest_score}% {a.passed ? '✓' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">Not attempted</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{a.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {a.time_limit_mins} mins
                  </span>

                  <button
                    onClick={() => handleStartAssessment(a.id)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-violet-600/30"
                  >
                    {a.has_attempted ? 'Re-test' : 'Start Assessment'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. ACTIVE QUIZ TEST ENVIRONMENT */}
      {isTestActive && activeAssessment && currentQ && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Top Test Header */}
          <div className="p-4 rounded-2xl bg-[#11131c] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-violet-400 font-bold">
                QUESTION {currentQuestionIdx + 1} OF {activeAssessment.questions.length}
              </span>
              <span className="text-xs text-slate-500">({currentQ.concept_tag})</span>
            </div>

            {/* Timer Bar */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl font-mono text-xs font-bold ${
              timeLeftSeconds < 120 ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-slate-800 text-cyan-300'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#11131c]/95 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question_text}
            </h3>

            {/* Code Snippet if applicable */}
            {currentQ.code_snippet && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 font-mono-code text-xs text-violet-200 overflow-x-auto leading-relaxed">
                <pre>{currentQ.code_snippet}</pre>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt: string, idx: number) => {
                const isSelected = selectedAnswers[currentQ.id] === opt;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    className={`p-4 rounded-2xl border cursor-pointer text-xs sm:text-sm font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500 text-white shadow-md shadow-violet-500/20'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{opt}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Nav Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleFlag(currentQ.id)}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                flaggedQuestions.includes(currentQ.id)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {flaggedQuestions.includes(currentQ.id) ? 'Flagged for Review' : 'Flag Question'}
            </button>

            <div className="flex items-center gap-3">
              {currentQuestionIdx > 0 && (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
              )}

              {currentQuestionIdx < activeAssessment.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitAssessment}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  Submit Assessment ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-SUBMISSION DETAILED RESULT SCREEN */}
      {testResult && activeAssessment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Result Score Banner */}
          <div className="p-8 rounded-3xl bg-[#11131c] border border-slate-800 text-center relative overflow-hidden shadow-2xl">
            <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest block mb-2">
              Assessment Report Card
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {activeAssessment.title}
            </h2>

            <div className="flex items-center justify-center gap-3 my-6">
              <span className={`text-6xl font-extrabold font-mono ${testResult.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {testResult.score}%
              </span>
              <div className="text-left">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full uppercase ${
                  testResult.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {testResult.passed ? 'Verified Mastered' : 'Needs Practice'}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  {testResult.correct_count} of {testResult.total_questions} questions answered correctly
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              {testResult.recommendation}
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setTestResult(null)}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition"
              >
                Back to Assessments
              </button>
            </div>
          </div>

          {/* Strong vs Weak Concepts Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4" /> Strong Competencies Verified
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {testResult.strong_concepts?.map((c: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-3">
                <AlertCircle className="w-4 h-4" /> Recommended Remediation Concepts
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {testResult.weak_concepts?.length > 0 ? (
                  testResult.weak_concepts.map((c: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{c}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No weak areas identified. Great job!</li>
                )}
              </ul>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Question Explanations & Solutions</h3>
            <div className="space-y-3">
              {testResult.breakdown?.map((q: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400">Question #{idx + 1} ({q.concept_tag})</span>
                    {q.is_correct ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-200">{q.question_text}</p>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block mb-0.5">Explanation:</span>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
