import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, BrainCircuit, Rocket } from 'lucide-react';

interface Phase {
  title: string;
  period: string;
  description: string;
  achievements: string[];
  icon: React.ReactNode;
  color: string;
}

const phases: Phase[] = [
  {
    title: "Theoretical Foundation",
    period: "2024 Q1 - Q2",
    description: "Conceptual groundwork for multi-agent orchestration and zero-gravity propulsion research framework.",
    achievements: [
      "Drafted anti-gravity whitepaper outlining electromagnetic flux constraints",
      "Designed Maestro's core neural synthesis architecture",
      "Established Pieces OS integration strategy for context continuity"
    ],
    icon: <BrainCircuit size={24} />,
    color: "from-purple-500 to-blue-500"
  },
  {
    title: "Proof of Concept",
    period: "2024 Q3",
    description: "Initial implementation of parallel agent conversations with local backbone integration.",
    achievements: [
      "Deployed Llama 3.1 70B on local hardware (192.168.0.241)",
      "Built first ConversationPod prototype with Gemini ⇄ Claude handshake",
      "Integrated real-time neural transmission logging"
    ],
    icon: <Zap size={24} />,
    color: "from-cyan-500 to-emerald-500"
  },
  {
    title: "Production System",
    period: "2024 Q4 - Present",
    description: "Full-scale AI Quantizer Hub with AR visualization, global synthesis, and cluster deployment.",
    achievements: [
      "Shipped AI Quantizer v3.5 with dynamic pod orchestration",
      "Implemented AR mode and diagnostic overlays for real-time monitoring",
      "Deployed to sanctum-node-control with automated handshake verification",
      "Achieved 99.2% stabilization in zero-gravity simulation mode"
    ],
    icon: <Rocket size={24} />,
    color: "from-blue-500 to-indigo-600"
  }
];

const EvolutionTimeline: React.FC = () => {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([2])); // Expand latest phase by default

  const togglePhase = (index: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">
          MAESTRO EVOLUTION TIMELINE
        </h2>
        <p className="text-sm text-slate-400 font-mono">
          From theoretical framework to production orchestration system
        </p>
      </div>

      <div className="relative">
        {/* Vertical timeline connector */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-500 to-blue-600 opacity-30"></div>

        {phases.map((phase, index) => {
          const isOpen = expandedPhases.has(index);
          const isLast = index === phases.length - 1;

          return (
            <div key={index} className="relative mb-6 last:mb-0">
              {/* Timeline node */}
              <div className={`absolute left-6 top-6 w-5 h-5 rounded-full bg-gradient-to-br ${phase.color} shadow-lg ring-4 ring-slate-950`}></div>

              {/* Phase card */}
              <div className="ml-16 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
                <button
                  onClick={() => togglePhase(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${phase.color} text-white`}>
                      {phase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-100 mb-0.5 group-hover:text-blue-400 transition-colors">
                        {phase.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                        {phase.period}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-300 transition-transform">
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </button>

                {/* Expandable content */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen ? '600px' : '0',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <div className="px-6 pb-6 border-t border-slate-800/50">
                    <p className="text-sm text-slate-300 mb-4 mt-4 leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Key Achievements
                      </h4>
                      {phase.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
                          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${phase.color} flex-shrink-0`}></div>
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Future connector line (optional visual flourish) */}
              {!isLast && (
                <div className="absolute left-8 top-full h-6 w-0.5 bg-gradient-to-b from-transparent to-slate-800/50"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-12 grid grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">3</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Major Phases</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">10+</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Achievements</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">99.2%</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Stability</div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionTimeline;
