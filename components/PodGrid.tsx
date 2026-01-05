import React, { useState } from 'react';
import { ConversationPod, PodStatus, AgentType } from '../types';
import { AGENT_ICONS, COLORS } from '../constants';
import { 
  Activity, 
  ArrowUpCircle, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  Plus,
  MessageSquare,
  ShieldCheck,
  Star,
  Layers,
  Columns,
  Trophy
} from 'lucide-react';

interface PodGridProps {
  pods: ConversationPod[];
  onSync: (pod: ConversationPod) => void;
  antiGravity?: boolean;
  debugMode?: boolean;
}

const ChromeLogo = ({ active }: { active: boolean }) => (
  <div className={`relative w-5 h-5 rounded-full flex items-center justify-center overflow-hidden transition-all ${active ? 'chrome-logo-active bg-white' : 'bg-slate-800 border border-slate-700 grayscale opacity-40'}`}>
    <svg viewBox="0 0 24 24" className="w-full h-full p-[1px]">
      <path fill="#EA4335" d="M12 0L24 12H12z" />
      <path fill="#FBBC04" d="M12 24L0 12h12z" />
      <path fill="#34A853" d="M0 12L12 0v12z" />
      <circle cx="12" cy="12" r="5" fill="#4285F4" stroke="white" strokeWidth="1" />
    </svg>
    {active && <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>}
  </div>
);

const PodGrid: React.FC<PodGridProps> = ({ pods, onSync, antiGravity, debugMode }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10 p-4">
      {pods.map((pod) => (
        <PodCard 
          key={pod.id} 
          pod={pod} 
          onSync={onSync} 
        />
      ))}
    </div>
  );
};

const PodCard: React.FC<{ 
  pod: ConversationPod; 
  onSync: (pod: ConversationPod) => void; 
}> = ({ pod, onSync }) => {
  const [localAr, setLocalAr] = useState(false);

  const getStatusColor = (status: PodStatus) => {
    switch (status) {
      case PodStatus.RUNNING: return 'bg-blue-500';
      case PodStatus.IDLE: return 'bg-slate-500';
      case PodStatus.SYNCING: return 'bg-amber-500';
      case PodStatus.ERROR: return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getProgress = () => (pod.currentTurn / pod.maxTurns) * 100;
  const isRunning = pod.status === PodStatus.RUNNING;

  // Snake Activity Calculation
  const totalChars = Object.values(pod.partnerThoughts || {}).reduce((acc, thought) => acc + (thought?.length || 0), 0);
  
  let snakeClass = "snake-blue"; // Default Ready
  let performanceTag = "READY";

  if (isRunning) {
    if (totalChars > 200 || pod.signalStrength > 90) {
      snakeClass = "snake-red";
      performanceTag = "ELITE NODE";
    } else if (totalChars > 100) {
      snakeClass = "snake-yellow";
      performanceTag = "HEATING UP";
    } else {
      snakeClass = "snake-green";
      performanceTag = "STABLE STREAM";
    }
  }

  return (
    <div className={`pod-card transition-all duration-500 ${(isRunning || pod.status === PodStatus.SYNCING) ? `gemini-active-node ${snakeClass} scale-[1.01]` : ''}`}>
      <div className={`node-container bg-[#0a0a0a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[480px] transition-all duration-300 ${localAr ? 'ring-2 ring-cyan-500' : ''}`}>
        
        {/* Browser Chrome Header */}
        <div className="bg-[#141414] px-3 py-2.5 flex flex-col gap-2 shrink-0 border-b border-black">
          {/* Tab Row */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 px-2 mr-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            
            <div className="flex-1 flex items-center gap-1 overflow-hidden">
               <div className={`px-4 py-1.5 rounded-t-xl border-t border-x border-slate-800 text-[10px] flex items-center gap-2 min-w-[180px] max-w-[240px] transition-colors ${isRunning ? 'bg-[#0f0f0f] text-blue-100' : 'bg-[#0a0a0a] text-slate-600'}`}>
                  <ChromeLogo active={isRunning} />
                  <span className="truncate font-bold tracking-tight">{pod.name} – Split Session</span>
                  <span className="ml-auto text-slate-700 hover:text-slate-400 cursor-pointer">×</span>
               </div>
               <div className="p-1 hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
                 <Plus size={14} className="text-slate-700" />
               </div>
            </div>
          </div>

          {/* Toolbar / Address Bar */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-center">
               <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500"><ChevronLeft size={16} /></button>
               <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500"><ChevronRightIcon size={16} /></button>
               <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 mr-1"><RotateCw size={14} className={isRunning ? "text-blue-500 animate-spin" : ""} /></button>
               
               <button 
                  onClick={() => onSync(pod)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all hover:bg-blue-500 active:scale-95 shadow-lg ${isRunning ? 'ring-1 ring-blue-400' : ''}`}
                >
                  <ArrowUpCircle size={14} />
                  SYNC
               </button>
            </div>
            
            <div className="flex-1 bg-black/60 rounded-full border border-white/5 px-4 py-1.5 flex items-center gap-2 group">
              <ShieldCheck size={12} className={`${isRunning ? 'text-emerald-500' : 'text-slate-800'}`} />
              <input 
                readOnly 
                value={pod.url || `https://${pod.id.toLowerCase()}.quantizer.ai/node-stream`} 
                className={`bg-transparent border-none outline-none text-[10px] font-mono w-full cursor-default selection:bg-blue-500/20 ${isRunning ? 'text-blue-300' : 'text-slate-700'}`}
              />
              <Star size={12} className="text-slate-800" />
            </div>

            <div className="flex gap-1">
              <button 
                onClick={() => setLocalAr(!localAr)}
                className={`p-1.5 rounded-md transition-colors ${localAr ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-700 hover:bg-slate-800'}`}
                title="Toggle Browser AR View"
              >
                <Layers size={16} />
              </button>
              <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-700"><MoreVertical size={16} /></button>
            </div>
          </div>
        </div>
        
        {/* Split Viewport Content */}
        <div className="flex-1 bg-[#050505] flex flex-col relative overflow-hidden">
          {localAr && (
             <div className="absolute inset-0 bg-cyan-500/5 z-10 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-400"></div>
             </div>
          )}

          {/* Sub-Header for Split Tab */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#080808]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <Columns size={12} /> Split_View_Active
              {isRunning && (
                <span className={`ml-4 px-2 py-0.5 rounded text-[8px] font-mono ${snakeClass === 'snake-red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}`}>
                   {performanceTag}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${getStatusColor(pod.status)} ${isRunning ? 'animate-pulse' : ''}`}></div>
               <span className={`text-[10px] font-bold uppercase tracking-widest ${isRunning ? 'text-blue-400' : 'text-slate-700'}`}>{pod.status}</span>
            </div>
          </div>
          
          <div className="flex-1 flex min-h-0">
            {/* Split Pane Left: Partner A */}
            <div className="split-tab-pane flex-1 p-4">
               <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                 <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border transition-all ${isRunning ? 'bg-blue-900/10 border-blue-500/40' : 'bg-slate-900 border-white/5'}`}>{AGENT_ICONS[pod.agents[0]]}</div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-tighter">{pod.agents[0]}</span>
                 </div>
               </div>
               <div className={`flex-1 overflow-y-auto pr-1 scrollbar-hide rounded-xl p-3 border transition-all ${isRunning ? 'bg-blue-950/10 border-blue-500/20' : 'bg-slate-900/20 border-white/5'}`}>
                  <p className={`text-[11px] leading-relaxed font-light italic transition-colors ${isRunning ? 'text-slate-200' : 'text-slate-700'}`}>
                    {pod.partnerThoughts?.[pod.agents[0]] || "Handshake pending..."}
                  </p>
               </div>
            </div>

            {/* Split Pane Right: Partner B */}
            <div className="split-tab-pane flex-1 p-4">
               <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                 <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border transition-all ${isRunning ? 'bg-purple-900/10 border-purple-500/40' : 'bg-slate-900 border-white/5'}`}>{AGENT_ICONS[pod.agents[1]]}</div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-tighter">{pod.agents[1]}</span>
                 </div>
               </div>
               <div className={`flex-1 overflow-y-auto pr-1 scrollbar-hide rounded-xl p-3 border transition-all ${isRunning ? 'bg-purple-950/10 border-purple-500/20' : 'bg-slate-900/20 border-white/5'}`}>
                  <p className={`text-[11px] leading-relaxed font-light italic transition-colors ${isRunning ? 'text-slate-200' : 'text-slate-700'}`}>
                    {pod.partnerThoughts?.[pod.agents[1]] || "Synchronizing peer link..."}
                  </p>
               </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-5 py-4 border-t border-white/5 space-y-4 bg-[#080808]">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-slate-800 uppercase tracking-widest font-bold">Consensus Progress</span>
                <span className={isRunning ? "text-blue-500 font-bold" : "text-slate-800"}>{Math.round(getProgress())}%</span>
              </div>
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-1000 ${pod.status === PodStatus.ERROR ? 'bg-rose-500' : isRunning ? (snakeClass === 'snake-red' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500') : 'bg-slate-800'}`}
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="text-[10px] font-mono text-slate-700 uppercase flex items-center gap-2">
                    Signal Quality: <span className={`${pod.signalStrength > 80 ? (snakeClass === 'snake-red' ? 'text-red-400' : 'text-blue-400') + ' font-bold' : 'text-amber-500'}`}>{pod.signalStrength}%</span>
                    {isRunning && <Activity size={12} className={snakeClass === 'snake-red' ? "text-red-500 animate-pulse" : "text-blue-500"} />}
                    {snakeClass === 'snake-red' && <Trophy size={14} className="text-yellow-500 ml-1" />}
                  </div>
               </div>
               
               <button 
                  onClick={() => onSync(pod)}
                  className={`flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-bold text-white transition-all shadow-xl active:scale-95`}
                >
                  <ArrowUpCircle size={14} />
                  NODE_SYNC
                </button>
            </div>
          </div>
        </div>

        {/* Browser Status Bar */}
        <div className="bg-[#111] h-7 flex items-center px-4 text-[8px] text-slate-800 font-mono border-t border-black/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${isRunning ? (snakeClass === 'snake-red' ? 'bg-red-500' : 'bg-[#34A853]') : 'bg-slate-900'}`}></div> 
            <span className={`uppercase tracking-[0.15em] ${isRunning ? (snakeClass === 'snake-red' ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold') : ''}`}>
              {isRunning ? `L_NODE_STABLE: ${performanceTag}` : 'L_NODE_STANDBY: PENDING_LINK'}
            </span>
          </div>
          <span className="ml-auto opacity-40 uppercase tracking-[0.2em]">
            RTT: {isRunning ? Math.floor(Math.random() * 3 + 4) : '--'}ms // Q_BUFFER: 2048_KB
          </span>
        </div>
      </div>
    </div>
  );
};

export default PodGrid;