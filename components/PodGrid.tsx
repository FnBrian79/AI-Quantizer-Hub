
import React, { useState, useRef, useEffect } from 'react';
import { ConversationPod, PodStatus, AgentType, ChatMessage } from '../types';
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
  Zap,
  Globe,
  X,
  Send,
  User,
  Brain,
  ChevronDown,
  ChevronUp,
  Trophy,
  AlertTriangle,
  Syringe,
} from 'lucide-react';

interface PodGridProps {
  pods: ConversationPod[];
  onSync: (pod: ConversationPod) => void;
  onRemove: (id: string) => void;
  onSendMessage: (podId: string, text: string) => void;
  onCrownMessage: (podId: string, messageId: string) => void;
  antiGravity?: boolean;
  debugMode?: boolean;
}

const ChromeLogo = ({ active }: { active: boolean }) => (
  <div className={`relative w-5 h-5 rounded-full flex items-center justify-center overflow-hidden transition-all ${active ? 'chrome-logo-active' : 'bg-slate-800 border border-slate-700 grayscale opacity-40'}`}>
    <img src={SPECIAL_ICON_URL} alt="Special Icon" className="w-full h-full object-cover" />
    {active && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>}
  </div>
);

// Derive pod alert level from state — this drives the color
function getPodAlertLevel(pod: ConversationPod): 'red' | 'yellow' | 'green' | 'blue' {
  if (pod.status === PodStatus.IDLE || pod.status === PodStatus.SYNCING) return 'blue';
  if (pod.status === PodStatus.ERROR || pod.needsArchitect) return 'red';

  // Check last 4 agent messages' reasoning scores
  const agentMsgs = pod.messages.filter(m => m.role !== 'user' && m.role !== 'backbone').slice(-4);
  if (agentMsgs.length >= 2) {
    const avgScore = agentMsgs.reduce((s, m) => s + (m.reasoningScore ?? 75), 0) / agentMsgs.length;
    if (avgScore < 55) return 'yellow'; // needs injection
  }

  return 'green'; // going well
}

const ALERT_STYLES = {
  red:    { snake: 'snake-red',    ring: 'ring-red-500/40',    label: '⚡ ARCHITECT NEEDED',  icon: <AlertTriangle size={12} className="text-red-400" />,    dot: 'bg-red-500',    text: 'text-red-400' },
  yellow: { snake: 'snake-yellow', ring: 'ring-yellow-500/30', label: '⚠ NEEDS INJECTION',   icon: <Syringe size={12} className="text-yellow-400" />,       dot: 'bg-yellow-400', text: 'text-yellow-400' },
  green:  { snake: 'snake-green',  ring: 'ring-emerald-500/20',label: 'GOING GOOD',           icon: <Zap size={12} className="text-emerald-400" />,          dot: 'bg-emerald-500',text: 'text-emerald-400' },
  blue:   { snake: 'snake-blue',   ring: 'ring-blue-500/20',   label: 'STANDBY',              icon: <Activity size={12} className="text-blue-400" />,        dot: 'bg-blue-500',   text: 'text-blue-400' },
};

const PodGrid: React.FC<PodGridProps> = ({ pods, onSync, onRemove, onSendMessage, onCrownMessage, antiGravity, debugMode }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10 p-4">
      {pods.map((pod) => (
        <PodCard
          key={pod.id}
          pod={pod}
          onSync={onSync}
          onRemove={onRemove}
          onSendMessage={onSendMessage}
          onCrownMessage={onCrownMessage}
        />
      ))}
    </div>
  );
};

// ── Collapsible Thinking Trace ─────────────────────────────────────────────
const ThinkingTrace: React.FC<{ thinking: string }> = ({ thinking }) => {
  const [open, setOpen] = useState(false);
  if (!thinking) return null;
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[8px] text-purple-500 hover:text-purple-300 font-mono uppercase tracking-widest transition-colors"
      >
        <Brain size={9} />
        {open ? 'Hide' : 'Show'} Reasoning Chain
        {open ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
      </button>
      {open && (
        <div className="mt-1.5 px-2 py-1.5 bg-purple-950/30 border border-purple-500/20 rounded-lg text-[9px] font-mono text-purple-300 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto scrollbar-hide">
          {thinking}
        </div>
      )}
    </div>
  );
};

// ── Reasoning Score Badge ──────────────────────────────────────────────────
const ScoreBadge: React.FC<{ score: number; difficulty?: number; runNumber?: number }> = ({ score, difficulty, runNumber }) => {
  const color = score >= 75 ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700/40'
    : score >= 50 ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/40'
    : 'bg-red-900/40 text-red-400 border-red-700/40';
  return (
    <div className={`flex items-center gap-1.5 mt-1.5 px-1.5 py-0.5 rounded border text-[7px] font-mono w-fit ${color}`}>
      <span>REASONING: {score}%</span>
      {difficulty && <span className="text-slate-600">· D{difficulty}/10</span>}
      {runNumber && <span className="text-slate-600">· R#{runNumber}</span>}
    </div>
  );
};

// ── Examiner (Backbone) Message ────────────────────────────────────────────
const ExaminerMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
  <div className="flex items-start gap-2 my-1">
    <div className="w-5 h-5 rounded-full bg-amber-950/60 border border-amber-600/40 flex items-center justify-center shrink-0 mt-0.5">
      <Brain size={10} className="text-amber-400" />
    </div>
    <div className="flex-1 bg-amber-950/20 border border-amber-500/20 rounded-xl px-3 py-2">
      <div className="text-[7px] font-bold uppercase tracking-widest text-amber-500 mb-1 flex items-center gap-1.5">
        <Brain size={7} /> BACKBONE EXAMINER
        {msg.difficulty && <span className="text-amber-700 font-mono">· D{msg.difficulty}/10</span>}
      </div>
      <p className="text-[11px] leading-relaxed text-amber-200">{msg.text}</p>
    </div>
  </div>
);

// ── Pod Card ───────────────────────────────────────────────────────────────
const PodCard: React.FC<{
  pod: ConversationPod;
  onSync: (pod: ConversationPod) => void;
  onRemove: (id: string) => void;
  onSendMessage: (podId: string, text: string) => void;
  onCrownMessage: (podId: string, messageId: string) => void;
}> = ({ pod, onSync, onRemove, onSendMessage, onCrownMessage }) => {
  const [localAr, setLocalAr] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const alertLevel = getPodAlertLevel(pod);
  const style = ALERT_STYLES[alertLevel];
  const isRunning = pod.status === PodStatus.RUNNING;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pod.messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(pod.id, trimmed);
    setInput('');
  };

  const getAgentColor = (role: string) => {
    switch (role) {
      case AgentType.GEMINI:   return 'text-blue-400';
      case AgentType.GROK:     return 'text-purple-400';
      case AgentType.CLAUDE:   return 'text-orange-400';
      case AgentType.CHATGPT:  return 'text-green-400';
      case AgentType.COPILOT:  return 'text-cyan-400';
      case AgentType.LOCAL_LLM:return 'text-pink-400';
      case AgentType.PIECES_OS:return 'text-cyan-300';
      case 'backbone':         return 'text-amber-400';
      case 'user':             return 'text-white';
      default:                 return 'text-slate-300';
    }
  };

  const getStatusColor = (status: PodStatus) => {
    switch (status) {
      case PodStatus.RUNNING:  return 'bg-emerald-500';
      case PodStatus.IDLE:     return 'bg-slate-500';
      case PodStatus.SYNCING:  return 'bg-blue-500';
      case PodStatus.ERROR:    return 'bg-rose-500';
      default:                 return 'bg-slate-500';
    }
  };

  return (
    <div className={`pod-card ${isRunning || pod.status === PodStatus.SYNCING ? `gemini-active-node ${style.snake} scale-[1.01]` : ''}`}>
      <div className={`node-container bg-[#0a0a0a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[520px] ${localAr ? 'ring-2 ring-cyan-500' : ''} ${alertLevel === 'red' ? 'ring-1 ring-red-500/50' : alertLevel === 'yellow' ? 'ring-1 ring-yellow-500/30' : ''}`}>

        {/* Browser Chrome Header */}
        <div className="bg-[#141414] px-3 py-2.5 flex flex-col gap-2 shrink-0 border-b border-black">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 px-2 mr-2 group/dots">
              <button
                onClick={() => onRemove(pod.id)}
                title="Close pod"
                className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff3b30] transition-colors flex items-center justify-center"
              >
                <X size={6} className="opacity-0 group-hover/dots:opacity-100 text-[#7d0000] transition-opacity" />
              </button>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="flex-1 flex items-center gap-1 overflow-hidden">
              <div className={`px-4 py-1.5 rounded-t-xl border-t border-x border-slate-800 text-[10px] flex items-center gap-2 min-w-[200px] max-w-[280px] ${isRunning ? 'bg-[#0f0f0f] text-blue-100' : 'bg-[#0a0a0a] text-slate-600'}`}>
                <ChromeLogo active={isRunning} />
                <span className="truncate font-bold tracking-tight">{pod.name}</span>
                {/* Color-coded alert badge in tab */}
                <span className={`ml-1 text-[7px] font-bold uppercase ${style.text}`}>{style.label}</span>
                <button onClick={() => onRemove(pod.id)} className="ml-auto p-0.5 hover:bg-slate-800 text-slate-700 hover:text-rose-400 rounded transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="p-1 hover:bg-slate-800 rounded-md cursor-pointer">
                <Plus size={14} className="text-slate-700" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-center">
              <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500"><ChevronLeft size={16} /></button>
              <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500"><ChevronRightIcon size={16} /></button>
              <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 mr-1"><RotateCw size={14} className={isRunning ? "text-blue-500" : ""} /></button>
              <button
                onClick={() => onSync(pod)}
                className={`flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-500 active:scale-95 shadow-lg ${isRunning ? 'ring-1 ring-blue-400' : ''}`}
              >
                <ArrowUpCircle size={14} />
                SYNC
              </button>
            </div>
            <div className="flex-1 bg-black/60 rounded-full border border-white/5 px-4 py-1.5 flex items-center gap-2 group">
              <ShieldCheck size={12} className={isRunning ? 'text-emerald-500' : 'text-slate-800'} />
              <input
                readOnly
                value={pod.url || `https://${pod.id.toLowerCase()}.quantizer.ai/node-stream`}
                className={`bg-transparent border-none outline-none text-[10px] font-mono w-full cursor-default ${isRunning ? 'text-blue-300' : 'text-slate-700'}`}
              />
              <Star size={12} className="text-slate-800" />
            </div>
            <div className="flex gap-1">
              <button onClick={() => setLocalAr(!localAr)} className={`p-1.5 rounded-md ${localAr ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-700 hover:bg-slate-800'}`}>
                <Layers size={16} />
              </button>
              <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-700"><MoreVertical size={16} /></button>
            </div>
          </div>
        </div>

        {/* Activity Header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5 bg-[#080808] shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <Globe size={12} /> Live_Neural_Stream
            {isRunning && (
              <span className={`ml-2 px-2 py-0.5 rounded text-[8px] font-mono flex items-center gap-1.5 ${alertLevel === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : alertLevel === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-slate-800 text-slate-400'}`}>
                {style.icon} {style.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Run counter */}
            {pod.runCount > 0 && (
              <span className="text-[8px] font-mono text-purple-500 bg-purple-950/30 border border-purple-700/30 px-1.5 py-0.5 rounded">
                RUN #{pod.runCount}
              </span>
            )}
            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(pod.status)}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isRunning ? 'text-emerald-400' : 'text-slate-700'}`}>{pod.status}</span>
          </div>
        </div>

        {/* Agent Tags */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#060606] border-b border-white/5 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-full border border-slate-800">
            {AGENT_ICONS[pod.agents[0]]}
            <span className={`text-[9px] font-bold ${getAgentColor(pod.agents[0])}`}>{pod.agents[0]}</span>
          </div>
          <span className="text-slate-700 text-xs">⇄</span>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-full border border-slate-800">
            {AGENT_ICONS[pod.agents[1]]}
            <span className={`text-[9px] font-bold ${getAgentColor(pod.agents[1])}`}>{pod.agents[1]}</span>
          </div>
          {/* Backbone examiner indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-950/20 border border-amber-700/20 rounded-full ml-1">
            <Brain size={9} className="text-amber-500" />
            <span className="text-[7px] font-bold text-amber-600 uppercase">EXAMINER</span>
          </div>
          <span className="ml-auto text-[8px] text-slate-700 font-mono">Turn {pod.currentTurn}/{pod.maxTurns}</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#050505] scrollbar-hide">
          {pod.messages.length === 0 && !pod.lastMessage && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-40">
              <Activity size={28} className="text-slate-700 mb-3" />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                No messages yet<br />Type below to inject a prompt
              </p>
            </div>
          )}

          {pod.messages.length === 0 && pod.lastMessage && (
            <div className="px-3 py-2 rounded-xl bg-slate-900/40 border border-white/5">
              <p className="text-[10px] text-slate-600 font-mono italic mb-1">— background activity —</p>
              <p className="text-[11px] text-slate-400 italic">{pod.lastMessage}</p>
            </div>
          )}

          {pod.messages.map((msg) => {
            // Backbone examiner messages get special rendering
            if (msg.role === 'backbone' && msg.isExaminerQuestion) {
              return <ExaminerMessage key={msg.id} msg={msg} />;
            }

            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${isUser ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-700'}`}>
                  {isUser ? <User size={10} className="text-white" /> : AGENT_ICONS[msg.role as AgentType] || <Activity size={10} />}
                </div>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 relative group ${
                  isUser
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                    : msg.isCrowned
                    ? 'bg-amber-950/40 border border-amber-500/50 text-slate-200'
                    : 'bg-slate-900/80 border border-white/5 text-slate-200'
                }`}>
                  {/* Header row */}
                  <div className={`text-[8px] font-bold uppercase tracking-wider mb-1 flex items-center gap-2 ${getAgentColor(msg.role as string)}`}>
                    <span>{isUser ? 'Architect' : msg.role}</span>
                    {msg.isCrowned && <Trophy size={9} className="text-amber-400" />}
                    {/* Crown button — only on agent messages */}
                    {!isUser && !msg.isCrowned && (
                      <button
                        onClick={() => onCrownMessage(pod.id, msg.id)}
                        title="Crown this reasoning path as winner"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-0.5 text-slate-600 hover:text-amber-400 hover:bg-amber-950/30 rounded"
                      >
                        <Star size={9} />
                      </button>
                    )}
                  </div>

                  {/* Answer text */}
                  <p className="text-[11px] leading-relaxed">{msg.text}</p>

                  {/* Collapsible thinking trace */}
                  {msg.thinking && <ThinkingTrace thinking={msg.thinking} />}

                  {/* Reasoning score badge */}
                  {msg.reasoningScore !== undefined && !isUser && (
                    <ScoreBadge score={msg.reasoningScore} difficulty={msg.difficulty} runNumber={msg.runNumber} />
                  )}

                  <div className="text-[7px] text-slate-700 mt-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}

          {pod.isAwaitingReply && (
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-slate-900 border border-slate-700">
                {AGENT_ICONS[pod.agents[0]]}
              </div>
              <div className="bg-slate-900/80 border border-white/5 rounded-2xl px-3 py-2">
                <div className="text-[7px] text-slate-600 font-mono mb-1 uppercase">Backbone processing...</div>
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="px-4 py-3 bg-[#0a0a0a] border-t border-white/5 shrink-0">
          <div className={`flex items-center gap-2 bg-slate-900 border rounded-xl px-3 py-2 transition-colors ${alertLevel === 'red' ? 'border-red-500/40 focus-within:border-red-400' : alertLevel === 'yellow' ? 'border-yellow-500/30 focus-within:border-yellow-400' : 'border-slate-800 focus-within:border-blue-500/50'}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={alertLevel === 'red' ? '⚡ Architect needed — inject guidance...' : alertLevel === 'yellow' ? '⚠ Inject to get back on track...' : `Inject prompt → ${pod.agents[0]} & ${pod.agents[1]}...`}
              disabled={pod.isAwaitingReply}
              className="flex-1 bg-transparent border-none outline-none text-[11px] text-slate-200 placeholder:text-slate-700 font-mono disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || pod.isAwaitingReply}
              className="p-1 text-slate-600 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
          <div className="text-[7px] text-slate-800 mt-1 font-mono text-center">
            Enter to inject · Backbone examiner auto-generates follow-ups · Signal: {pod.signalStrength}%
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#111] h-6 flex items-center px-4 text-[8px] text-slate-800 font-mono border-t border-black/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></div>
            <span className={`uppercase tracking-[0.15em] ${style.text} font-bold`}>
              {alertLevel === 'red' ? 'ARCHITECT_REQUIRED' : alertLevel === 'yellow' ? 'INJECTION_NEEDED' : alertLevel === 'green' ? 'L_NODE_STABLE' : 'L_NODE_STANDBY'}
            </span>
          </div>
          <span className="ml-auto opacity-40 uppercase tracking-[0.2em]">
            {pod.messages.filter(m => m.role !== 'user' && m.role !== 'backbone').length} responses
            {' '}//
            {' '}{pod.messages.filter(m => m.isCrowned).length > 0 ? `⭐ ${pod.messages.filter(m => m.isCrowned).length} crowned` : 'Signal: ' + pod.signalStrength + '%'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PodGrid;
