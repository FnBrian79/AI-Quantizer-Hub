
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Settings, 
  Terminal as TerminalIcon, 
  Cpu, 
  Database, 
  RefreshCcw, 
  Server,
  Play,
  Square,
  ChevronRight,
  Plus,
  ZapOff,
  Zap,
  Box,
  Bug,
  LineChart,
  BarChart2,
  CloudUpload,
  BrainCircuit,
  CheckCircle2,
  FileText,
  UserPlus,
  Eye,
  Rocket,
  ShieldAlert
} from 'lucide-react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { ConversationPod, BackboneState, PromptContract, PodStatus, AgentType, ContextSnippet } from './types';
import { INITIAL_PODS, INITIAL_PROMPT_CONTRACT, AGENT_ICONS, COLORS, MOCK_SNIPPETS } from './constants';
import PodGrid from './components/PodGrid';
import BackboneStatus from './components/BackboneStatus';
import PromptEvolution from './components/PromptEvolution';
import ControlPanel from './components/ControlPanel';
import PiecesOSContext from './components/PiecesOSContext';

const THOUGHT_SNIPPETS = [
  "Cross-referencing vector shards...",
  "Applying anti-gravity constraints to the core.",
  "Synthesizing partner feedback on efficiency.",
  "Optimizing zero-point energy flux pinning.",
  "Retrieving Pieces OS context for session continuity.",
  "Detecting gravity-well anomalies in the cluster.",
  "Refining the prompt contract based on score.",
  "Handshaking with local backbone (Llama 3.1)."
];

const Dashboard: React.FC = () => {
  const [pods, setPods] = useState<ConversationPod[]>(INITIAL_PODS);
  const [antiGravity, setAntiGravity] = useState<boolean>(true);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [arMode, setArMode] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  
  // Agent Selection State
  const [agent1, setAgent1] = useState<AgentType>(AgentType.GEMINI);
  const [agent2, setAgent2] = useState<AgentType>(AgentType.CLAUDE);

  const [backbone, setBackbone] = useState<BackboneState>({
    address: '192.168.0.241',
    status: 'Online',
    model: 'Llama 3.1 70B',
    memoryUsage: '42.4 / 64 GB',
    activeThreads: 12,
    synthesizedInsights: [
      'Identified cross-agent consensus on piezoelectric cooling.',
      'Refined Arctic Harvesting prompt for better constraints.',
      'Pieces OS agent successfully captured schematics.'
    ]
  });
  const [contract, setContract] = useState<PromptContract>(INITIAL_PROMPT_CONTRACT);
  const [snippets, setSnippets] = useState<ContextSnippet[]>(MOCK_SNIPPETS);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 99)
    ]);
  }, []);

  const handleSyncToBackbone = useCallback((pod: ConversationPod) => {
    if (!pod.lastMessage || pod.lastMessage.trim() === '') {
      addLog(`Sync skipped: ${pod.name} has no signal data.`);
      return;
    }

    const snippet = pod.lastMessage.length > 45 
      ? `${pod.lastMessage.substring(0, 45).trim()}...` 
      : pod.lastMessage;

    const strengthValue = typeof pod.signalStrength === 'number' && !isNaN(pod.signalStrength) 
      ? pod.signalStrength 
      : 0;

    const newInsight = `[Node ${pod.name}] Insight Aggregated: "${snippet}" (QA-Score: ${strengthValue}%)`;

    setBackbone(prev => ({
      ...prev,
      synthesizedInsights: [
        newInsight,
        ...prev.synthesizedInsights.slice(0, 5)
      ]
    }));
    
    addLog(`NEURAL_SYNC: Pod [${pod.name}] payload integrated into local backbone cluster.`);
  }, [addLog]);

  const runGlobalSynthesis = async () => {
    addLog("Initiating Global Neural Synthesis using Gemini-3-Flash...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const activeThoughts = pods
        .map(p => p.lastMessage)
        .filter(msg => msg && msg.length > 0)
        .join("\n- ");
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these parallel neural thought streams from an anti-gravity propulsion research session and synthesize the top 3 breakthrough insights into a single sentence:\n- ${activeThoughts}`,
      });

      const synthesis = response.text || "Synthesis inconclusive due to signal noise.";
      addLog(`GEMINI_SYNTHESIS: ${synthesis}`);
      
      setBackbone(prev => ({
        ...prev,
        synthesizedInsights: [
          `Gemini Synthesis: ${synthesis.substring(0, 70)}...`,
          ...prev.synthesizedInsights.slice(0, 5)
        ]
      }));
    } catch (error) {
      addLog(`Synthesis Error: ${error instanceof Error ? error.message : "Unknown API error"}`);
    }
  };

  const deployCluster = () => {
    setIsDeploying(true);
    setDeployProgress(0);
    addLog("DEPLOY: Initiating transfer to coil-operator-sanctum-node-control...");
    
    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsDeploying(false), 2000);
          addLog("DEPLOY_SUCCESS: Cluster running on sanctum-node-control.");
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleCreatePod = () => {
    const id = `pod-${pods.length + 1}`;
    const newPod: ConversationPod = {
      id,
      name: `Browser-${pods.length + 1 < 10 ? '0' : ''}${pods.length + 1}`,
      agents: [agent1, agent2],
      status: PodStatus.RUNNING,
      currentTurn: 0,
      maxTurns: 10,
      signalStrength: 0,
      url: `https://node-${pods.length + 1}.quantizer.ai/live`,
      partnerThoughts: {}
    };
    setPods(prev => [...prev, newPod]);
    addLog(`LAUNCH: Neural bridge established for ${agent1} ⇄ ${agent2}`);
  };

  const runStressTest = useCallback(() => {
    addLog("DEBUG: Initiating Cluster Stress Test...");
    setPods(current => current.map(p => ({
      ...p,
      status: Math.random() > 0.5 ? PodStatus.RUNNING : PodStatus.SYNCING,
      signalStrength: Math.floor(Math.random() * 100)
    })));
    
    setBackbone(prev => ({
      ...prev,
      memoryUsage: `${(Math.random() * 20 + 40).toFixed(1)} / 64 GB`,
      activeThreads: Math.floor(Math.random() * 24 + 8)
    }));
  }, [addLog]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPods(currentPods => currentPods.map(pod => {
        if (pod.status === PodStatus.RUNNING) {
          const nextTurn = pod.currentTurn + 1;
          const activeAgent = pod.agents[nextTurn % 2];
          const newThought = THOUGHT_SNIPPETS[Math.floor(Math.random() * THOUGHT_SNIPPETS.length)];
          
          if (nextTurn >= pod.maxTurns) {
            return { ...pod, currentTurn: pod.maxTurns, status: PodStatus.SYNCING };
          }

          return { 
            ...pod, 
            currentTurn: nextTurn,
            lastMessage: newThought,
            partnerThoughts: {
              ...pod.partnerThoughts,
              [activeAgent]: newThought
            }
          };
        }
        if (pod.status === PodStatus.SYNCING) {
          return { ...pod, status: PodStatus.IDLE, signalStrength: Math.floor(Math.random() * 30) + 70 };
        }
        return pod;
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col h-screen overflow-hidden text-slate-200 transition-all duration-1000 ${arMode ? 'ar-active' : ''} ${antiGravity ? 'bg-slate-950 bg-[radial-gradient(circle_at_center,_rgba(2,6,23,1)_0%,_rgba(15,23,42,1)_100%)]' : 'bg-slate-950'} ${debugMode ? 'scanline-overlay' : ''}`}>
      <div className="ar-grid-overlay"></div>
      <div className="ar-hud-frame"></div>
      
      {debugMode && <div className="fixed inset-0 pointer-events-none z-50 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>}

      {isDeploying && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
          <CloudUpload size={64} className="text-blue-500 mb-6" />
          <h2 className="text-3xl font-bold mb-2 tracking-tighter text-blue-400">DEPLOYING CLUSTER</h2>
          <p className="text-slate-400 text-sm mb-8 font-mono">Target: coil-operator-sanctum-node-control (us-west1)</p>
          <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden mb-4 border border-white/5 shadow-2xl">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${deployProgress}%` }}></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-blue-400 font-mono uppercase tracking-[0.3em]">
              {deployProgress < 100 ? 'Syncing node states...' : 'Handshake Verified'}
            </span>
            {deployProgress === 100 && <CheckCircle2 size={24} className="text-emerald-500" />}
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shrink-0 z-[100] relative shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Activity className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              AI QUANTIZER 
              <span className="text-slate-500 font-normal uppercase tracking-[0.2em] ml-2 text-sm">v3.5</span>
            </h1>
            <a href="https://github.com/mythos-b1eda/antigravity-whitepaper" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
              <FileText size={10} /> Antigravity Whitepaper
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setArMode(!arMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${arMode ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'}`}
          >
            <Eye size={14} />
            {arMode ? 'AR MODE: ACTIVE' : 'AR MODE: OFF'}
          </button>

          <button 
            onClick={runGlobalSynthesis}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded-md text-[10px] font-bold transition-all hover:bg-purple-600/40"
          >
            <BrainCircuit size={14} />
            GLOBAL SYNTHESIS
          </button>

          <button 
            onClick={deployCluster}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold transition-all hover:bg-blue-500 shadow-lg shadow-blue-900/40"
          >
            <CloudUpload size={14} />
            DEPLOY CLUSTER
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1"></div>

          <button 
            onClick={() => setDebugMode(!debugMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${debugMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
          >
            <Bug size={14} />
            DIAGNOSTICS
          </button>

          <button 
            onClick={() => setAntiGravity(!antiGravity)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${antiGravity ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
          >
            {antiGravity ? <Zap size={14} /> : <ZapOff size={14} />}
            {antiGravity ? 'ZERO-G' : 'GRAVITY'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 flex gap-6 relative z-10 transition-transform duration-1000 ease-in-out">
        <div className="flex-[3] flex flex-col gap-6">
          <section className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-2 text-blue-100/90">
                  <Box size={18} className="text-blue-400" />
                  QUANTIZER NODE LAUNCHER
                  <span className="text-slate-500 text-[10px] font-mono ml-1 uppercase bg-slate-950 px-1.5 py-0.5 rounded tracking-tighter">Active: {pods.length}</span>
                </h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Initialize a new parallel research handshake</p>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest ml-1">Research Partner A</span>
                  <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
                    {AGENT_ICONS[agent1]}
                    <select 
                      value={agent1} 
                      onChange={(e) => setAgent1(e.target.value as AgentType)}
                      className="bg-transparent border-none outline-none text-[11px] font-bold text-blue-400 cursor-pointer pr-2"
                    >
                      {Object.values(AgentType).map(type => <option key={type} value={type} className="bg-slate-900">{type}</option>)}
                    </select>
                  </div>
                </div>
                <div className="text-slate-700 font-bold text-lg self-end mb-1 px-1">⇄</div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest ml-1">Research Partner B</span>
                  <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
                    {AGENT_ICONS[agent2]}
                    <select 
                      value={agent2} 
                      onChange={(e) => setAgent2(e.target.value as AgentType)}
                      className="bg-transparent border-none outline-none text-[11px] font-bold text-purple-400 cursor-pointer pr-2"
                    >
                      {Object.values(AgentType).map(type => <option key={type} value={type} className="bg-slate-900">{type}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleCreatePod}
                  className="ml-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg active:scale-95 group"
                >
                  <Rocket size={18} />
                  <span className="text-xs font-bold uppercase tracking-tighter">Launch</span>
                </button>
              </div>

              <button 
                onClick={() => setPods(prev => prev.map(p => ({...p, status: PodStatus.RUNNING})))}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-xl text-xs font-bold transition-all"
              >
                <Play size={14} /> START ALL
              </button>
            </div>
            
            <PodGrid pods={pods} onSync={handleSyncToBackbone} antiGravity={antiGravity} debugMode={debugMode} />
          </section>

          <section className="flex-1 min-h-[250px] flex flex-col">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-100">
              <TerminalIcon size={18} className="text-emerald-400" />
              NEURAL TRANSMISSION FEED
            </h2>
            <div className="flex-1 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 font-mono text-xs overflow-auto scrollbar-hide shadow-inner ring-1 ring-white/5">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">No neural signal detected...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`mb-1.5 border-l-2 pl-3 ${log.includes('DEBUG') ? 'text-emerald-500/80 border-emerald-500/30' : log.includes('GEMINI') ? 'text-purple-400 font-bold border-purple-500/50' : 'text-slate-300 border-slate-700'}`}>
                    <span className="text-slate-500 font-bold mr-2">{log.substring(0, 10)}</span>
                    {log.substring(10)}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="flex-[2] flex flex-col gap-6">
          <BackboneStatus backbone={backbone} />
          <PiecesOSContext snippets={snippets} debugMode={debugMode} />
          <PromptEvolution contract={contract} />
          <ControlPanel onAction={(msg) => {
            if (msg.includes('Stress Test')) runStressTest();
            else addLog(msg);
          }} />
        </div>
      </main>
      
      <footer className="px-6 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono z-[100] relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">THROUGHPUT:</span>
            <span className="text-blue-400">42.1 t/s</span>
            <div className="w-16 h-4 flex items-end gap-0.5 ml-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-blue-500/40 w-1" style={{ height: `${Math.random() * 100}%` }}></div>
              ))}
            </div>
          </div>
          <div className="h-3 w-px bg-slate-800"></div>
          <span className="flex items-center gap-1.5"><ShieldAlert size={10} className="text-emerald-500" /> PIECES SYNC: <span className="text-cyan-400">NOMINAL</span></span>
          <div className="h-3 w-px bg-slate-800"></div>
          <span>STABILIZATION: <span className={antiGravity ? "text-cyan-400" : "text-slate-500"}>{antiGravity ? "99.2%" : "OFF"}</span></span>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-blue-400 transition-colors cursor-pointer">{backbone.model}</span>
          <span className={arMode ? "text-cyan-400 font-bold" : "text-slate-700"}>AR_READY</span>
          <span className="text-slate-600">SESSION: FNB-X-9941-K</span>
        </div>
      </footer>
    </div>
  );
};

// Main App component with routing
const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
};

// Fixing the missing default export
export default App;
