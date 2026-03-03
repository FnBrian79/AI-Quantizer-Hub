
import React, { useState } from 'react';
import { PromptContract } from '../types';
import { RefreshCcw, ArrowRight, Code, ListFilter, Github, Link as LinkIcon, CheckCircle } from 'lucide-react';

interface Props {
  contract: PromptContract;
  onUpdate?: (updates: Partial<PromptContract>) => void;
}

const PromptEvolution: React.FC<Props> = ({ contract, onUpdate }) => {
  const [repoInput, setRepoInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectRepo = () => {
    if (!repoInput || !onUpdate) return;
    setIsConnecting(true);
    // Simulate API connection delay
    setTimeout(() => {
      onUpdate({ githubRepo: repoInput });
      setIsConnecting(false);
      setRepoInput('');
    }, 1500);
  };

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
        
        {/* Orchestration Maestro Section */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Github size={12} className={contract.githubRepo ? "text-white" : "text-slate-600"} /> 
            Orchestration Maestro Context
          </label>
          
          {contract.githubRepo ? (
             <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white rounded-full text-black">
                    <Github size={12} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300 tracking-tight">{contract.githubRepo}</span>
                    <span className="text-[8px] text-emerald-500 flex items-center gap-1">
                      <CheckCircle size={8} /> LIVE_SYNC_ACTIVE
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdate && onUpdate({ githubRepo: undefined })}
                  className="text-[9px] text-slate-500 hover:text-red-400 uppercase font-bold underline decoration-slate-700"
                >
                  Unlink
                </button>
             </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <Github size={12} />
                </div>
                <input 
                  type="text" 
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="github_user/repo_name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-8 pr-3 text-[10px] font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
                />
              </div>
              <button 
                onClick={handleConnectRepo}
                disabled={!repoInput || isConnecting}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${isConnecting ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'}`}
                aria-label="Connect repository"
              >
                {isConnecting ? '...' : <LinkIcon size={12} />}
              </button>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-800/50 my-2"></div>

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
            <div className="absolute inset-0 flex items-center justify-around px-8 opacity-30">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-1 h-8 bg-emerald-500/20 rounded-full"></div>
               ))}
            </div>
            <div className="relative z-10 flex items-center gap-4 text-[10px] font-mono">
               <span className="text-slate-500">RAW DATA</span>
               <ArrowRight size={14} className="text-emerald-500" />
               <span className="text-emerald-400 font-bold uppercase">Synthesizer</span>
               <ArrowRight size={14} className="text-emerald-500" />
               <span className="text-slate-500">CONTRACT V{contract.version + 1}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20">
        EVOLVE MANUALLY
      </button>
    </section>
  );
};

export default PromptEvolution;