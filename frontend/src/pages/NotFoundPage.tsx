import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-2xl">
        <Sparkles className="w-8 h-8 text-violet-400" />
      </div>
      <span className="font-mono text-xs font-bold text-violet-400 tracking-widest uppercase">404 Error</span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Page Not Found</h1>
      <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md">
        The route you are looking for has either been moved or does not exist in the current SkillForge curriculum graph.
      </p>
      <NavLink
        to="/dashboard"
        className="mt-6 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </NavLink>
    </div>
  );
};
