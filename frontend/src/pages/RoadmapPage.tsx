import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  BookOpen,
  FolderGit2,
  CheckSquare,
  Clock,
  X,
  ArrowRight,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { RoadmapGraph, RoadmapNode } from '../types';

export const RoadmapPage: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRoadmap = async () => {
    try {
      const res = await api.getRoadmap();
      setRoadmap(res.roadmap);
      if (res.roadmap?.nodes?.length > 0 && !selectedNode) {
        // Find recommended or in_progress node by default
        const activeNode = res.roadmap.nodes.find((n: RoadmapNode) => n.status === 'in_progress' || n.status === 'recommended') || res.roadmap.nodes[0];
        setSelectedNode(activeNode);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTopic = async (topicIdx: number) => {
    if (!selectedNode) return;
    try {
      const res = await api.toggleStepTopic(selectedNode.id, topicIdx);
      // Update local state
      const updatedTopics = res.topics;
      const completedCount = updatedTopics.filter((t: any) => t.completed).length;
      const updatedProf = Math.round((completedCount / updatedTopics.length) * 100);

      const updatedNode = {
        ...selectedNode,
        topics: updatedTopics,
        current_proficiency: updatedProf,
        status: (updatedProf >= 80 ? 'completed' : updatedProf > 0 ? 'in_progress' : selectedNode.status) as any
      };

      setSelectedNode(updatedNode);
      // Refresh entire graph
      fetchRoadmap();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteEntireStep = async () => {
    if (!selectedNode) return;
    try {
      await api.completeStep(selectedNode.id);
      fetchRoadmap();
      setSelectedNode({
        ...selectedNode,
        current_proficiency: 100,
        status: 'completed',
        topics: selectedNode.topics.map(t => ({ ...t, completed: true }))
      });
    } catch (e) {
      console.error(e);
    }
  };

  const stages = Array.from(new Set(roadmap?.nodes?.map(n => n.stage_name) || []));

  const filteredNodes = roadmap?.nodes?.filter(n => {
    if (filterStage === 'all') return true;
    return n.stage_name === filterStage;
  }) || [];

  const getNodeStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle2 };
      case 'in_progress':
        return { label: 'In Progress', bg: 'bg-violet-500/20 text-violet-300 border-violet-500/40', icon: Play };
      case 'recommended':
        return { label: 'Recommended Next', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: Sparkles };
      case 'available':
        return { label: 'Available', bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: GitMerge };
      case 'locked':
      default:
        return { label: 'Locked', bg: 'bg-slate-900 text-slate-500 border-slate-800', icon: Lock };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold mb-1">
            <GitMerge className="w-4 h-4" />
            <span>GRAPH CURRICULUM (v{roadmap?.version || '2026.2'})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {roadmap?.title || 'Personalized Engineering Roadmap'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            {roadmap?.description || 'Interactive prerequisite DAG graph tailored for your career goal.'}
          </p>
        </div>

        {/* Overall Completion Metric */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Roadmap Velocity</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-extrabold font-mono text-white">
                {roadmap?.progress_percent || 0}%
              </span>
              <span className="text-xs text-slate-400">
                ({roadmap?.completed_nodes || 0}/{roadmap?.total_nodes || 0} nodes)
              </span>
            </div>
          </div>
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
              style={{ width: `${roadmap?.progress_percent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Stages Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Stage:
          </span>
          <button
            onClick={() => setFilterStage('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterStage === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Stages ({roadmap?.total_nodes || 0})
          </button>
          {stages.map((stg) => (
            <button
              key={stg}
              onClick={() => setFilterStage(stg)}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
                filterStage === stg
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" /> In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Recommended</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600" /> Locked</span>
        </div>
      </div>

      {/* Main Roadmap Area: Interactive Graph & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Skill Graph Grid (7 or 8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl bg-[#11131c]/80 border border-slate-800 p-6 backdrop-blur-xl relative overflow-hidden min-h-[550px]">
          {/* Ambient Graph Backdrop Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Node Cards in Ordered Dependency Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {filteredNodes.map((node) => {
              const statusMeta = getNodeStatusBadge(node.status);
              const StatusIcon = statusMeta.icon;
              const isSelected = selectedNode?.id === node.id;

              return (
                <motion.div
                  key={node.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-left flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/20 shadow-xl'
                      : node.status === 'completed'
                      ? 'bg-slate-900/70 border-emerald-500/40 hover:border-emerald-500/80'
                      : node.status === 'in_progress'
                      ? 'bg-slate-900/80 border-violet-500/50 hover:border-violet-400'
                      : node.status === 'recommended'
                      ? 'bg-slate-900/80 border-cyan-500/60 hover:border-cyan-400'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-70 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  {/* Top Node Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${statusMeta.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusMeta.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Step #{node.step_order}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-white leading-snug">
                      {node.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {node.description}
                    </p>
                  </div>

                  {/* Node Bottom Progress & Meta */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] text-slate-400">{node.estimated_hours}h</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-300">
                        {node.current_proficiency}%
                      </span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            node.status === 'completed'
                              ? 'bg-emerald-500'
                              : node.status === 'in_progress'
                              ? 'bg-violet-500'
                              : 'bg-cyan-500'
                          }`}
                          style={{ width: `${node.current_proficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Node Side Panel (5 or 4 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-[#11131c] border border-slate-800 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-5">
              {/* Header & Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">
                    {selectedNode.stage_name}
                  </span>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${getNodeStatusBadge(selectedNode.status).bg}`}>
                    {getNodeStatusBadge(selectedNode.status).label}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedNode.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Progress Metric Bar */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Node Mastery</span>
                  <span className="font-mono font-bold text-white">{selectedNode.current_proficiency}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${selectedNode.current_proficiency}%` }}
                  />
                </div>
              </div>

              {/* Interactive Topics Checklist */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Key Topics & Concepts ({selectedNode.topics.filter(t => t.completed).length}/{selectedNode.topics.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedNode.topics.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleTopic(idx)}
                      className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center gap-2.5 text-xs transition"
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => {}} // Handled by container click
                        className="rounded border-slate-700 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={t.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated Resources & Assessment Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <NavLink
                  to={`/learning?skill_id=${selectedNode.skill_id}`}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition text-left group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                  <span className="font-bold text-white">{selectedNode.resource_count || 4}</span>
                  <span className="text-[10px] text-slate-500 block">Curated Resources</span>
                </NavLink>

                <NavLink
                  to={selectedNode.assessment_id ? `/assessments` : '/assessments'}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition text-left group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                  <span className="font-bold text-white">
                    {selectedNode.assessment_score ? `${selectedNode.assessment_score}%` : 'Ready'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Verified Assessment</span>
                </NavLink>
              </div>

              {/* Primary Actions */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <NavLink
                  to={`/learning?skill_id=${selectedNode.skill_id}`}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-violet-600/30"
                >
                  Continue Learning <ArrowRight className="w-4 h-4" />
                </NavLink>

                {selectedNode.status !== 'completed' && (
                  <button
                    onClick={handleCompleteEntireStep}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition border border-slate-800"
                  >
                    Mark Entire Node Completed
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <GitMerge className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-white">Select a Roadmap Node</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Click on any node in the graph above to view its prerequisites, interactive topics checklist, resources, and assessments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
