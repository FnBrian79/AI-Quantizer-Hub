
import React from 'react';
import { PromptContract } from '../types';
import { RefreshCcw, ArrowRight, Code, ListFilter } from 'lucide-react';

interface Props {
  contract: PromptContract;
}

const PromptEvolution: React.FC<Props> = ({ contract }) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCcw size={20} className="text-emerald-400" />
          PROMPT CONTRACT <span className="text-slate-500 font-normal">V{contract.version}</span>
        </h2>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
          <span className="text-slate-500">M2M SCORE:</span>
          <span className="font-bold">{contract.evolutionScore}/10</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-auto">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Code size={12} /> Active Base Pattern
          </label>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono leading-relaxed text-blue-300">
            {contract.basePrompt}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <ListFilter size={12} /> Quantized Constraints
          </label>
          <div className="grid gap-2">
            {contract.constraints.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-800 rounded-md text-[11px]">
                <ArrowRight size={10} className="text-slate-600" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Self-Improvement Loop</label>
          <div className="h-16 relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
            {/* Visual loop animation placeholder */}
            <div className="absolute inset-0 flex items-center justify-around px-8 opacity-30">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-1 h-8 bg-emerald-500/20 rounded-full"></div>
               ))}
            </div>
            <div className="relative z-10 flex items-center gap-4 text-[10px] font-mono">
               <span className="text-slate-500">RAW DATA</span>
               <ArrowRight size={14} className="text-emerald-500 animate-pulse" />
               <span className="text-emerald-400 font-bold uppercase">Synthesizer</span>
               <ArrowRight size={14} className="text-emerald-500 animate-pulse" />
               <span className="text-slate-500">CONTRACT V{contract.version + 1}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-900/20">
        EVOLVE MANUALLY
      </button>
    </section>
  );
};

export default PromptEvolution;
