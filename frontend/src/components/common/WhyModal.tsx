import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, X, Info } from 'lucide-react';

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  careerTarget?: string;
  reasons: string[];
}

export const WhyModal: React.FC<WhyModalProps> = ({
  isOpen,
  onClose,
  title,
  careerTarget,
  reasons
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog Container */}
          <motion.div
            className="relative w-full max-w-lg bg-[#11131c] border border-slate-800/90 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Top Accent Light */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Why This Recommendation?
                  </h3>
                  {careerTarget && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tailored for your target role: <span className="text-violet-400 font-medium">{careerTarget}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-sm font-semibold text-slate-200">
                {title}
              </p>
            </div>

            {/* Transparent Bullet Factors */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Underlying SkillForge Engine Factors:
              </span>
              <ul className="space-y-2.5">
                {reasons.map((reason, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span>Deterministic, explainable reasoning.</span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
