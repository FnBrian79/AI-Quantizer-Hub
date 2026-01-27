import React from 'react';
import { ContextSnippet } from '../types';
import { Link2, Sparkles, Database, History, Search, Box } from 'lucide-react';

interface Props {
  snippets: ContextSnippet[];
  debugMode?: boolean;
}

const PiecesOSContext: React.FC<Props> = ({ snippets, debugMode }) => {
  return (
    <section className="bg-slate-900 border border-cyan-900/30 rounded-2xl p-5 shadow-xl pieces-glow relative overflow-hidden">
      {debugMode && (
        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-cyan-600 uppercase tracking-widest">
          Memory Trace: ACTIVE
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
          <Link2 size={20} className="text-cyan-400" />
          PIECES OS AGENT
        </h2>
        <div className="flex gap-1.5">
           <button aria-label="Search context" className="p-1.5 bg-cyan-950/40 text-cyan-500 hover:bg-cyan-900/60 rounded-md border border-cyan-800/30 transition-colors">
             <Search size={14} />
           </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <AbilityTag icon={<Sparkles size={10} />} label="LTM Retrieval" />
        <AbilityTag icon={<Database size={10} />} label="Snippet Sync" />
        <AbilityTag icon={<Box size={10} />} label="Quantized Context" />
      </div>

      <div className="space-y-3">
        <div className="text-[10px] font-bold text-cyan-800 tracking-widest uppercase mb-2">Neural Snippets</div>
        {snippets.map((snip) => (
          <div key={snip.id} className="bg-slate-950/80 p-3 rounded-lg border border-cyan-900/20 group hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-mono text-cyan-600 uppercase tracking-tighter">{snip.source}</span>
              <span className="text-[9px] font-mono text-cyan-700">{Math.round(snip.relevance * 100)}% Context Match</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2 font-light italic">
              "{snip.content}"
            </p>
            {debugMode && (
              <div className="mb-2 p-1.5 bg-cyan-950/50 rounded border border-cyan-900/30 text-[8px] font-mono text-cyan-500 space-y-0.5">
                <div>UUID: {snip.id}</div>
                <div>SEMANTIC_VECTOR: [0.84, -0.22, 0.45...]</div>
              </div>
            )}
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-600">
              <span>CAPTURED: {new Date(snip.timestamp).toLocaleTimeString()}</span>
              <button className="text-cyan-600 hover:text-cyan-400 uppercase font-bold tracking-widest transition-colors">Restore</button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-800/30 text-cyan-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 group">
        <Sparkles size={14} /> ANALYZE CROSS-CONTEXT
      </button>
    </section>
  );
};

const AbilityTag: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-950/30 border border-cyan-900/40 rounded text-[9px] font-bold text-cyan-500 whitespace-nowrap">
    {icon}
    {label}
  </div>
);

export default PiecesOSContext;