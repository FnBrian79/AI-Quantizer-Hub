
import React from 'react';
import { BackboneState } from '../types';
import { Shield, Server, HardDrive, Cpu, ExternalLink } from 'lucide-react';

interface Props {
  backbone: BackboneState;
}

const BackboneStatus: React.FC<Props> = ({ backbone }) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield size={20} className="text-purple-400" />
          BACKBONE (LOCAL)
        </h2>
        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          {backbone.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-1">
            <Server size={12} /> HOST
          </div>
          <div className="text-sm font-mono font-medium text-slate-200">{backbone.address}</div>
        </div>
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-1">
            <Cpu size={12} /> MODEL
          </div>
          <div className="text-sm font-medium text-slate-200 truncate">{backbone.model}</div>
        </div>
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-1">
            <HardDrive size={12} /> RAM (QUANT)
          </div>
          <div className="text-sm font-mono font-medium text-slate-200">{backbone.memoryUsage}</div>
        </div>
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-1">
            <Cpu size={12} /> THREADS
          </div>
          <div className="text-sm font-mono font-medium text-slate-200">{backbone.activeThreads} ACTIVE</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Synthesized Insights</div>
        {backbone.synthesizedInsights.map((insight, i) => (
          <div key={i} className="flex gap-3 text-xs leading-relaxed group cursor-default">
            <span className="text-purple-500 shrink-0 mt-1">•</span>
            <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{insight}</span>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all">
        SSH fnbrian@192.168.0.241 <ExternalLink size={12} />
      </button>
    </section>
  );
};

export default BackboneStatus;
