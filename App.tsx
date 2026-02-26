
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
  ShieldAlert,
  X,
  KeyRound,
  Wifi,
  WifiOff
} from 'lucide-react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { loadSecure, saveSecure } from './secureStorage';
import { ConversationPod, BackboneState, PromptContract, PodStatus, AgentType, ContextSnippet } from './types';
import { INITIAL_PODS, INITIAL_PROMPT_CONTRACT, AGENT_ICONS, COLORS, MOCK_SNIPPETS, SPECIAL_ICON_URL } from './constants';
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

  // ── Settings — encrypted via SubtleCrypto; async-loaded on mount ─────────────
  const [showSettings, setShowSettings] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const defaultSettings = {
    backboneIP:       '192.168.0.202',
    backbonePort:     '11434',
    backboneModel:    '',
    geminiApiKey:     '',
    openaiApiKey:     '',
    anthropicApiKey:  '',
  };
  const [settings, setSettings]           = useState(defaultSettings);
  const [settingsDraft, setSettingsDraft] = useState(defaultSettings);

  // Decrypt on mount (~3 ms); first render uses defaults.
  useEffect(() => {
    loadSecure(defaultSettings).then(loaded => {
      setSettings(loaded);
      setSettingsDraft(loaded);
      if (!loaded.backboneIP) setShowSettings(true); // first-run wizard
    });
  }, []);

  // Fire-and-forget encrypt on every settings save.
  useEffect(() => {
    saveSecure(settings).catch(() => {});
  }, [settings]);

  const [backbone, setBackbone] = useState<BackboneState>({
    address: '192.168.0.202',
    status: 'Online',
    model: 'sovereign-qwen',
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

  // ── Settings helpers (need addLog in scope) ───────────────────────────────
  const testConnection = async () => {
    if (!settingsDraft.backboneIP) return;
    setTestStatus('testing');
    try {
      const res = await fetch(
        `http://${settingsDraft.backboneIP}:${settingsDraft.backbonePort}/api/tags`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        setTestStatus('ok');
        const data = await res.json().catch(() => ({ models: [] }));
        const models: string[] = (data.models || []).map((m: { name: string }) => m.name);
        if (!settingsDraft.backboneModel && models.length > 0) {
          setSettingsDraft(p => ({ ...p, backboneModel: models[0] }));
        }
      } else {
        setTestStatus('fail');
      }
    } catch {
      setTestStatus('fail');
    }
  };

  const saveSettings = () => {
    setSettings(settingsDraft);
    setBackbone(prev => ({
      ...prev,
      address: settingsDraft.backboneIP,
      model:   settingsDraft.backboneModel || prev.model,
    }));
    addLog(`SETTINGS: Backbone → ${settingsDraft.backboneIP}:${settingsDraft.backbonePort} | model: ${settingsDraft.backboneModel}`);
    setShowSettings(false);
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const handleUpdateContract = useCallback((updates: Partial<PromptContract>) => {
    setContract(prev => ({ ...prev, ...updates, lastUpdated: Date.now() }));
    if (updates.githubRepo) {
      addLog(`MAESTRO: Contract context updated via GitHub repo: ${updates.githubRepo}`);
    } else {
      addLog("MAESTRO: Contract evolution constraints updated.");
    }
  }, [addLog]);

  const handleSyncToBackbone = useCallback((pod: ConversationPod) => {
    // If the lastMessage is empty or null, log a 'Sync skipped' message and return early
    if (!pod.lastMessage || pod.lastMessage.trim() === '') {
      addLog(`Sync skipped: ${pod.name} has no signal data.`);
      return;
    }

    // If a pod's lastMessage is longer than 40 characters, ensure it is truncated and append '...'
    const snippet = pod.lastMessage.length > 40 
      ? `${pod.lastMessage.substring(0, 40).trim()}...` 
      : pod.lastMessage;

    // Ensure the pod.signalStrength is a valid number
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
    
    // Dynamically include the pod's name and signal strength in the log message
    addLog(`NEURAL_SYNC: Pod [${pod.name}] (${strengthValue}%) payload integrated into local backbone cluster.`);
  }, [addLog]);

  const runGlobalSynthesis = async () => {
    if (!settings.geminiApiKey) {
      addLog("SYNTHESIS_ERROR: Gemini API key not set — open Settings (⚙) to add it.");
      setShowSettings(true);
      return;
    }
    addLog("Initiating Global Neural Synthesis using Gemini-3-Flash...");
    try {
      const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });
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
    const id = `pod-${Date.now()}`;
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

  const handleRemovePod = useCallback((id: string) => {
    setPods(prev => prev.filter(pod => pod.id !== id));
    addLog(`NODE_TERMINATED: Pod [${id}] has been closed and resources reclaimed.`);
  }, [addLog]);

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
    <div className={`flex flex-col h-screen overflow-hidden text-slate-200 ${arMode ? 'ar-active' : ''} ${antiGravity ? 'bg-slate-950 bg-[radial-gradient(circle_at_center,_rgba(2,6,23,1)_0%,_rgba(15,23,42,1)_100%)]' : 'bg-slate-950'} ${debugMode ? 'scanline-overlay' : ''}`}>
      <div className="ar-grid-overlay"></div>
      <div className="ar-hud-frame"></div>
      
      {debugMode && <div className="fixed inset-0 pointer-events-none z-50 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>}

      {isDeploying && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
          <CloudUpload size={64} className="text-blue-500 mb-6" />
          <h2 className="text-3xl font-bold mb-2 tracking-tighter text-blue-400">DEPLOYING CLUSTER</h2>
          <p className="text-slate-400 text-sm mb-8 font-mono">Target: coil-operator-sanctum-node-control (us-west1)</p>
          <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden mb-4 border border-white/5 shadow-2xl">
            <div className="h-full bg-blue-500" style={{ width: `${deployProgress}%` }}></div>
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
          <div className="w-10 h-10 overflow-hidden rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] bg-slate-800 flex items-center justify-center border border-white/10 group">
             <img src={SPECIAL_ICON_URL} alt="Quantizer Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors border ${arMode ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'}`}
          >
            <Eye size={14} />
            {arMode ? 'AR MODE: ACTIVE' : 'AR MODE: OFF'}
          </button>

          <button 
            onClick={runGlobalSynthesis}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded-md text-[10px] font-bold transition-colors hover:bg-purple-600/40"
          >
            <BrainCircuit size={14} />
            GLOBAL SYNTHESIS
          </button>

          <button 
            onClick={deployCluster}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold transition-colors hover:bg-blue-500 shadow-lg shadow-blue-900/40"
          >
            <CloudUpload size={14} />
            DEPLOY CLUSTER
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1"></div>

          <button 
            onClick={() => setDebugMode(!debugMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors border ${debugMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
          >
            <Bug size={14} />
            DIAGNOSTICS
          </button>

          <button
            onClick={() => setAntiGravity(!antiGravity)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${antiGravity ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
          >
            {antiGravity ? <Zap size={14} /> : <ZapOff size={14} />}
            {antiGravity ? 'ZERO-G' : 'GRAVITY'}
          </button>

          <button
            onClick={() => { setSettingsDraft(settings); setTestStatus('idle'); setShowSettings(true); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-md text-[10px] font-bold transition-colors"
            title="Settings"
          >
            <Settings size={14} />
            SETTINGS
          </button>
        </div>
      </header>

      {/* ── Settings Modal ─────────────────────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Settings size={16} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">HUB SETTINGS</h2>
                <p className="text-[10px] text-slate-500 font-mono">Keys encrypted with AES-GCM 256-bit</p>
              </div>
            </div>

            {/* Backbone */}
            <div className="mb-5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Server size={10} /> Backbone (Ollama)
              </p>
              {!settings.backboneIP && (
                <p className="text-[9px] text-amber-400 font-mono mb-2">⚠ No backbone configured — enter your Beast/Ollama IP below</p>
              )}
              <div className="flex gap-2 mb-2">
                <input
                  type="text" placeholder="IP (e.g. 192.168.0.202)"
                  className="flex-[3] bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-500 transition-colors"
                  value={settingsDraft.backboneIP}
                  onChange={e => { setSettingsDraft(p => ({ ...p, backboneIP: e.target.value })); setTestStatus('idle'); }}
                />
                <input
                  type="text" placeholder="Port"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-500 transition-colors"
                  value={settingsDraft.backbonePort}
                  onChange={e => setSettingsDraft(p => ({ ...p, backbonePort: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="text" placeholder="Model (e.g. sovereign-qwen)"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-500 transition-colors"
                  value={settingsDraft.backboneModel}
                  onChange={e => setSettingsDraft(p => ({ ...p, backboneModel: e.target.value }))}
                />
                <button
                  onClick={testConnection}
                  disabled={testStatus === 'testing' || !settingsDraft.backboneIP}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-40 flex items-center gap-1.5"
                >
                  {testStatus === 'testing' ? <RefreshCcw size={12} className="animate-spin text-blue-400" /> :
                   testStatus === 'ok'      ? <Wifi size={12} className="text-emerald-400" /> :
                   testStatus === 'fail'    ? <WifiOff size={12} className="text-red-400" /> :
                                             <Wifi size={12} className="text-slate-500" />}
                  TEST
                </button>
              </div>
              {testStatus === 'ok'   && <p className="text-[9px] text-emerald-400 font-mono">✓ Reachable at {settingsDraft.backboneIP}:{settingsDraft.backbonePort}</p>}
              {testStatus === 'fail' && <p className="text-[9px] text-red-400 font-mono">✗ Cannot reach {settingsDraft.backboneIP}:{settingsDraft.backbonePort} — is Ollama running?</p>}
            </div>

            {/* API Keys */}
            <div className="mb-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <KeyRound size={10} /> API Keys
              </p>
              {[
                { label: 'Gemini',    key: 'geminiApiKey',    placeholder: 'AIza…' },
                { label: 'OpenAI',   key: 'openaiApiKey',    placeholder: 'sk-…'  },
                { label: 'Anthropic', key: 'anthropicApiKey', placeholder: 'sk-ant-…' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-slate-500 w-16 shrink-0">{label}</span>
                  <input
                    type="password" placeholder={placeholder}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-500 transition-colors"
                    value={(settingsDraft as Record<string, string>)[key]}
                    onChange={e => setSettingsDraft(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={saveSettings}
                className="flex-[2] px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-900/40"
              >
                SAVE &amp; ENCRYPT
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────────────── */}

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
                  <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest ml-1">Partner A</span>
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
                  <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest ml-1">Partner B</span>
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
            
            <PodGrid 
              pods={pods} 
              onSync={handleSyncToBackbone} 
              onRemove={handleRemovePod}
              antiGravity={antiGravity} 
              debugMode={debugMode} 
            />
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
          <PromptEvolution contract={contract} onUpdate={handleUpdateContract} />
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

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;