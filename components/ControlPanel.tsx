
import React from 'react';
import { Play, Square, RefreshCcw, Send, Settings2, Bug, Zap } from 'lucide-react';

interface Props {
  onAction: (msg: string) => void;
}

const ControlPanel: React.FC<Props> = ({ onAction }) => {
  const handleAction = (name: string) => {
    onAction(`Triggering action: ${name}`);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-400 uppercase tracking-widest">
        <Settings2 size={16} /> SYSTEM_CONTROLS
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleAction('Full Resync')}
          className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium transition-all border border-slate-700/50"
        >
          <RefreshCcw size={14} className="text-blue-400" /> RESYNC ALL
        </button>
        <button 
          onClick={() => handleAction('Stress Test')}
          className="flex items-center justify-center gap-2 py-3 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-600/30 rounded-xl text-xs font-bold transition-all"
        >
          <Zap size={14} /> STRESS TEST
        </button>
        <button 
          onClick={() => handleAction('Start All Workers')}
          className="flex items-center justify-center gap-2 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-xl text-xs font-bold transition-all"
        >
          <Play size={14} /> START CLUSTER
        </button>
        <button 
          onClick={() => handleAction('Emergency Halt')}
          className="flex items-center justify-center gap-2 py-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold transition-all"
        >
          <Square size={14} /> HALT ALL
        </button>
      </div>

      <div className="mt-5 p-3 bg-slate-950 rounded-xl border border-slate-800">
        <div className="text-[9px] font-bold text-slate-600 mb-2 uppercase tracking-tighter">Manual Neural Injection</div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="fnbrian@backbone:~$ "
            aria-label="Manual injection command"
            className="flex-1 bg-transparent border-none outline-none text-[10px] text-blue-400 font-mono"
          />
          <button
            className="p-1 text-slate-600 hover:text-blue-400 transition-colors"
            aria-label="Send manual injection"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ControlPanel;
