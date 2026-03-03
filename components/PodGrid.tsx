
import React, { useState } from 'react';
import { ConversationPod, PodStatus, AgentType } from '../types';
import { AGENT_ICONS, SPECIAL_ICON_URL } from '../constants';
import { 
  Activity, 
  ArrowUpCircle, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  Plus,
  ShieldCheck,
  Star,
  Layers,
  Trophy,
  Flame,
  Zap,
  Globe,
  X,
  Box
} from 'lucide-react';

interface PodGridProps {
  pods: ConversationPod[];
  onSync: (pod: ConversationPod) => void;
  onRemove: (id: string) => void;
  antiGravity?: boolean;
  debugMode?: boolean;
}

const ChromeLogo = ({ active }: { active: boolean }) => (
  <div className={`relative w-5 h-5 rounded-full flex items-center justify-center overflow-hidden transition-all ${active ? 'chrome-logo-active' : 'bg-slate-800 border border-slate-700 grayscale opacity-40'}`}>
    <img src={SPECIAL_ICON_URL} alt="Special Icon" className="w-full h-full object-cover" />
    {active && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>}
  </div>
);

const PodGrid: React.FC<PodGridProps> = ({ pods, onSync, onRemove, antiGravity, debugMode }) => {
  if (pods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-800/50 rounded-2xl bg-slate-900/10 p-8 text-center mx-4">
        <Box size={48} className="text-slate-800 mb-4" />
        <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-[0.2em]">No Active Nodes Detected</h3>
        <p className="text-[10px] font-mono text-slate-600 max-w-sm">
          Neural bridge disconnected. Initialize a new handshake sequence from the launcher to establish quantum entanglement.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10 p-4">
      {pods.map((pod) => (
        <PodCard 
          key={pod.id} 
          pod={pod} 
          onSync={onSync} 
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const PodCard: React.FC<{ 
  pod: ConversationPod; 
  onSync: (pod: ConversationPod) => void; 
  onRemove: (id: string) => void;
}> = ({ pod, onSync, onRemove }) => {
  const [localAr, setLocalAr] = useState(false);

  const getStatusColor = (status: PodStatus) => {
    switch (status) {
      case PodStatus.RUNNING: return 'bg-emerald-500';
      case PodStatus.IDLE: return 'bg-slate-500';
      case PodStatus.SYNCING: return 'bg-blue-500';
      case PodStatus.ERROR: return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const isRunning = pod.status === PodStatus.RUNNING;

  // Aggregate density (character count) across the thought stream
  const thoughtsArray = Object.values(pod.partnerThoughts || {}) as (string | undefined)[];
  const totalChars = thoughtsArray.reduce((acc: number, thought) => acc + (thought?.length || 0), 0);
  
  // Logic for Snake Performance Spectrum
  let snakeClass = "snake-blue"; 
  let performanceTag = "READY";
  let performanceIcon = <Zap size={12} className="text-blue-400" />;

  if (pod.status === PodStatus.IDLE || pod.status === PodStatus.SYNCING) {
    snakeClass = "snake-blue";
    performanceTag = pod.status === PodStatus.SYNCING ? "SYNCING..." : "READY TO GO";
    performanceIcon = <Activity size={12} className="text-blue-400" />;
  } else if (isRunning) {
    if (totalChars > 300 || pod.signalStrength > 90) {
      snakeClass = "snake-red";
      performanceTag = "CREAM OF CROP";
      performanceIcon = <Trophy size={12} className="text-red-500" />;
    } else if (totalChars > 150) {
      snakeClass = "snake-yellow";
      performanceTag = "HEATING UP";
      performanceIcon = <Flame size={12} className="text-yellow-500" />;
    } else {
      snakeClass = "snake-green";
      performanceTag = "GOING GOOD";
      performanceIcon = <Zap size={12} className="text-emerald-500" />;
    }
  }

  return (
    <div className={`pod-card ${(isRunning || pod.status === PodStatus.SYNCING || pod.status === PodStatus.IDLE) ? `gemini-active-node ${snakeClass} scale-[1.01]` : ''}`}>
      <div className={`node-container bg-[#0a0a0a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[420px] ${localAr ? 'ring-2 ring-cyan-500' : ''}`}>
        
        {/* Browser Chrome Header */}
        <div className="bg-[#141414] px-3 py-2.5 flex flex-col gap-2 shrink-0 border-b border-black">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 px-2 mr-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            
            <div className="flex-1 flex items-center gap-1 overflow-hidden">
               <div className={`px-4 py-1.5 rounded-t-xl border-t border-x border-slate-800 text-[10px] flex items-center gap-2 min-w-[200px] max-w-[280px] ${isRunning ? 'bg-[#0f0f0f] text-blue-100' : 'bg-[#0a0a0a] text-slate-600'}`}>
                  <ChromeLogo active={isRunning} />
                  <span className="truncate font-bold tracking-tight">{pod.name} – {performanceTag}</span>
                  <button 
                    onClick={() => onRemove(pod.id)}
                    className="ml-auto p-0.5 hover:bg-slate-800 text-slate-700 hover:text-rose-400 rounded transition-colors"
                    aria-label={`Remove pod ${pod.name}`}
                  >
                    <X size={12} />
                  </button>
               </div>
               <div
                 className="p-1 hover:bg-slate-800 rounded-md cursor-pointer"
                 role="button"
                 aria-label="New Tab"
               >
                 <Plus size={14} className="text-slate-700" />
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-center">
               <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500" aria-label="Previous tab"><ChevronLeft size={16} /></button>
               <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500" aria-label="Next tab"><ChevronRightIcon size={16} /></button>
               <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 mr-1" aria-label="Refresh content"><RotateCw size={14} className={isRunning ? "text-blue-500" : ""} /></button>
               
               <button 
                  onClick={() => onSync(pod)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-500 active:scale-95 shadow-lg ${isRunning ? 'ring-1 ring-blue-400' : ''}`}
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
                className={`p-1.5 rounded-md ${localAr ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-700 hover:bg-slate-800'}`}
                aria-label={localAr ? "Disable AR view" : "Enable AR view"}
              >
                <Layers size={16} />
              </button>
              <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-700" aria-label="More options"><MoreVertical size={16} /></button>
            </div>
          </div>
        </div>
        
        {/* Unified Content Viewport */}
        <div className="flex-1 bg-[#050505] flex flex-col relative overflow-hidden">
          {localAr && (
             <div className="absolute inset-0 bg-cyan-500/5 z-10 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-400"></div>
             </div>
          )}

          {/* Activity Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#080808]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <Globe size={12} /> Live_Neural_Stream
              {isRunning && (
                <span className={`ml-4 px-2 py-0.5 rounded text-[8px] font-mono flex items-center gap-1.5 ${snakeClass === 'snake-red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}`}>
                   {performanceIcon} {performanceTag}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${getStatusColor(pod.status)}`}></div>
               <span className={`text-[10px] font-bold uppercase tracking-widest ${isRunning ? 'text-emerald-400' : 'text-slate-700'}`}>{pod.status}</span>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col gap-4">
              {isRunning ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg">
                        {AGENT_ICONS[pod.agents[0]]}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg">
                        {AGENT_ICONS[pod.agents[1]]}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                      {pod.agents[0]} ⇄ {pod.agents[1]} COLLABORATING
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-2xl border ${snakeClass === 'snake-red' ? 'bg-red-950/10 border-red-500/20' : 'bg-slate-900/40 border-white/5'}`}>
                    <p className={`text-[12px] leading-relaxed font-light italic ${isRunning ? 'text-slate-200' : 'text-slate-700'}`}>
                      {pod.lastMessage || "Establishing secure handshake..."}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[9px] font-mono text-slate-600 uppercase">
                        Current Thought Density: <span className={totalChars > 200 ? 'text-emerald-400' : 'text-slate-500'}>{totalChars} units</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-600 uppercase">
                        Signal: {pod.signalStrength}%
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40">
                  <Activity size={32} className="text-slate-700 mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Node Hibernating... <br/> Awaiting Sync Command</p>
                </div>
              )}
            </div>
          </div>

          {/* Simplified Footer - No Progress Bar */}
          <div className="px-5 py-4 border-t border-white/5 bg-[#080808]">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="text-[10px] font-mono text-slate-700 uppercase flex items-center gap-2">
                    Signal Quality: <span className={`${pod.signalStrength > 80 ? (snakeClass === 'snake-red' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold') : 'text-amber-500'}`}>{pod.signalStrength}%</span>
                    {isRunning && performanceIcon}
                  </div>
               </div>
               
               <button 
                  onClick={() => onSync(pod)}
                  className={`flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-bold text-white shadow-xl active:scale-95`}
                >
                  <ArrowUpCircle size={14} />
                  SYNC_NODE
                </button>
            </div>
          </div>
        </div>

        {/* Lower Status Info */}
        <div className="bg-[#111] h-7 flex items-center px-4 text-[8px] text-slate-800 font-mono border-t border-black/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${isRunning ? (snakeClass === 'snake-red' ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-900'}`}></div> 
            <span className={`uppercase tracking-[0.15em] ${isRunning ? (snakeClass === 'snake-red' ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold') : ''}`}>
              {isRunning ? `L_NODE_STABLE: ${performanceTag}` : 'L_NODE_STANDBY: LINK_PENDING'}
            </span>
          </div>
          <span className="ml-auto opacity-40 uppercase tracking-[0.2em]">
            RTT: {isRunning ? Math.floor(Math.random() * 3 + 4) : '--'}ms // BUFFER: 4096_PKT
          </span>
        </div>
      </div>
    </div>
  );
};

export default PodGrid;
