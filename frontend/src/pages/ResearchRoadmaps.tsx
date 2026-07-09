import { useState } from 'react';
import {
  Sparkles,
  Zap,
  Bookmark,
  Save,
  FileText,
  Share2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  mockRoadmaps,
  mockAiTip,
  type Roadmap,
} from '@/data/roadmapMockData';

export default function ResearchRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(mockRoadmaps);
  const [newTopic, setNewTopic] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  const activeRoadmap = roadmaps.find((r) => r.active) ?? roadmaps[0];

  const handleToggleNode = (nodeId: string) => {
    setRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id === activeRoadmap.id) {
          const updatedNodes = rm.nodes.map((node) =>
            node.id === nodeId ? { ...node, completed: !node.completed } : node
          );
          const completedCount = updatedNodes.filter((n) => n.completed).length;
          const percent = Math.round((completedCount / updatedNodes.length) * 100);
          return {
            ...rm,
            nodes: updatedNodes,
            completedNodes: completedCount,
            percentComplete: percent,
          };
        }
        return rm;
      })
    );
    toast.info('Roadmap progress updated!');
  };

  const handleSetActive = (rmId: string) => {
    setRoadmaps((prev) =>
      prev.map((rm) => ({
        ...rm,
        active: rm.id === rmId,
      }))
    );
  };

  const handleBuildRoadmap = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTopic.trim()) {
      toast.info('Type a topic first!', {
        description: 'E.g., "Transformer mechanics", "Diffusion models"',
      });
      return;
    }

    setIsBuilding(true);

    setTimeout(() => {
      setIsBuilding(false);
      const newRmId = `rm-${Date.now()}`;
      const newRm: Roadmap = {
        id: newRmId,
        title: newTopic.trim(),
        percentComplete: 0,
        nodesCount: 3,
        completedNodes: 0,
        active: true,
        nodes: [
          {
            id: 'n-1',
            title: `Foundations of ${newTopic.trim()}`,
            difficulty: 'Beginner',
            description: `Core concepts, background context, and mathematical definitions to establish prerequisites for ${newTopic.trim()}.`,
            duration: '2 Hours',
            completed: false,
          },
          {
            id: 'n-2',
            title: `Core Architectures & Models`,
            difficulty: 'Intermediate',
            description: `Analyzing structural implementations, benchmarking common configurations, and reviewing classic academic papers.`,
            duration: '4 Hours',
            completed: false,
          },
          {
            id: 'n-3',
            title: `Advanced Optimization & Applications`,
            difficulty: 'Advanced',
            description: `Scalability barriers, modern hybrid methodologies, and current research frontiers in this subject area.`,
            duration: '6 Hours',
            completed: false,
          }
        ],
      };

      setRoadmaps((prev) =>
        prev.map((rm) => ({ ...rm, active: false })).concat(newRm)
      );

      setNewTopic('');
      toast.success('Roadmap generated!', {
        description: `Successfully compiled structured path for "${newRm.title}".`,
      });
    }, 1800);
  };

  const handleExport = () => {
    toast.success('PDF Export Initiated', {
      description: `Downloading report for "${activeRoadmap.title}"`,
    });
  };

  const handleShare = () => {
    toast.info('Share options opened', {
      description: 'You can generate a collaborative review link.',
    });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100/50">
      
      {/* ── Left Column: Main Roadmap Workspace ────────── */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto">
        <div className="p-6 md:p-8 max-w-[800px] mx-auto w-full space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-none">
              Research Roadmaps
            </h1>
            <p className="font-inter text-xs text-slate-400 mt-1.5">
              Transform complex research topics into structured learning journeys.
            </p>
          </div>

          {/* Generator Input Box Card */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] space-y-3">
            <p className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase select-none">
              Generate a New Roadmap
            </p>
            <form onSubmit={handleBuildRoadmap} className="flex gap-3">
              <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Retrieval Augmented Generation, Transformer Architectures..."
                  className="flex-1 bg-transparent font-inter text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0 pr-2"
                />
              </div>
              <button
                type="submit"
                disabled={isBuilding}
                className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-xs md:text-sm transition-all duration-150 shadow active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none flex-shrink-0"
              >
                {isBuilding ? (
                  <>Building...</>
                ) : (
                  <>
                    Build Roadmap
                    <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current Active Roadmap Title Banner */}
          <div className="flex items-center justify-center py-2 select-none">
            <div className="h-[1px] bg-slate-200 flex-1" />
            <h2 className="font-hanken font-bold text-lg text-primary px-4 leading-none">
              {activeRoadmap.title}
            </h2>
            <div className="h-[1px] bg-slate-200 flex-1" />
          </div>

          {/* Node Progression Flow */}
          <div className="flex flex-col items-center">
            {activeRoadmap.nodes && activeRoadmap.nodes.length > 0 ? (
              activeRoadmap.nodes.map((node, index) => (
                <div key={node.id} className="w-full flex flex-col items-center">
                  
                  {/* Node Card */}
                  <div className={`w-full max-w-[620px] bg-white border rounded-xl p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] transition-all flex flex-col gap-4 text-left ${
                    node.completed ? 'border-primary/40 bg-indigo-50/10' : 'border-slate-200'
                  }`}>
                    <div className="flex items-start justify-between gap-4 select-none">
                      <h3 className="font-hanken font-bold text-slate-800 text-sm md:text-base leading-snug">
                        {node.title}
                      </h3>
                      
                      {/* Difficulty Badge */}
                      <span className={`font-mono text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase ${
                        node.difficulty === 'Beginner' ? 'bg-emerald-50 text-success-green border border-emerald-100' :
                        node.difficulty === 'Intermediate' ? 'bg-amber-50 text-warning-amber border border-amber-100' :
                        'bg-rose-50 text-error-red border border-rose-100'
                      }`}>
                        {node.difficulty}
                      </span>
                    </div>

                    <p className="font-inter text-xs text-slate-500 leading-relaxed text-justify">
                      {node.description}
                    </p>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 select-none">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-inter text-[11px] font-medium">
                          {node.duration}
                        </span>
                      </div>

                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        onClick={() => handleToggleNode(node.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-inter text-xs font-semibold ${
                          node.completed
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${node.completed ? 'text-white' : 'text-slate-400'}`} />
                        <span>{node.completed ? 'Completed' : 'Mark as done'}</span>
                      </button>
                    </div>

                  </div>

                  {/* Flow Connector Line */}
                  {index < activeRoadmap.nodes.length - 1 && (
                    <div className="w-[1.5px] h-8 bg-slate-200 my-1" />
                  )}

                </div>
              ))
            ) : (
              <div className="py-12 select-none text-center space-y-2">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-inter text-sm font-semibold text-slate-400">
                  This roadmap is not compiled yet. Submit a topic above to generate a path.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Right Column: Sidebar Panel ────────────── */}
      <div className="w-[300px] flex-shrink-0 h-full bg-white border-l border-slate-200 flex flex-col justify-between select-none">
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Section: My Roadmaps */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <h3 className="font-hanken font-bold text-sm text-slate-900 leading-none">
              My Roadmaps
            </h3>
            
            <div className="space-y-2">
              {roadmaps.map((rm) => (
                <div
                  key={rm.id}
                  onClick={() => handleSetActive(rm.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    rm.active
                      ? 'border-primary bg-indigo-50/20 shadow-sm'
                      : 'border-slate-100 hover:border-indigo-50 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Bookmark className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      rm.active ? 'text-primary fill-primary' : 'text-slate-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-hanken font-semibold text-slate-800 text-xs md:text-sm leading-snug">
                        {rm.title}
                      </h4>
                      <p className="font-inter text-[10.5px] text-slate-400 mt-1">
                        {rm.percentComplete}% Complete &bull; {rm.completedNodes}/{rm.nodesCount} Nodes
                      </p>

                      {/* Small progress bar */}
                      {rm.percentComplete > 0 && (
                        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${rm.percentComplete}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Actions */}
          <div className="p-4 border-b border-slate-200 space-y-2">
            <p className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase pb-1">
              Actions
            </p>
            <button
              onClick={() => toast.success('Roadmap progress saved successfully.')}
              className="w-full flex items-center gap-2.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-left font-inter text-xs font-semibold text-slate-600 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" />
              Save Roadmap
            </button>
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-2.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-left font-inter text-xs font-semibold text-slate-600 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Export as PDF
            </button>
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-2.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-left font-inter text-xs font-semibold text-slate-600 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              Share with Team
            </button>
          </div>
        </div>

        {/* AI Tip Box */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 text-left space-y-1.5">
            <span className="font-mono text-[8.5px] font-bold tracking-widest text-primary uppercase">
              AI Tip
            </span>
            <p className="font-inter text-[11px] text-slate-600 leading-normal text-justify italic">
              "{mockAiTip.text}"
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
