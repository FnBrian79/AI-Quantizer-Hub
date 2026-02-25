
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
  Save
} from 'lucide-react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { ConversationPod, BackboneState, PromptContract, PodStatus, AgentType, ContextSnippet, ChatMessage } from './types';
import { INITIAL_PODS, INITIAL_PROMPT_CONTRACT, AGENT_ICONS, COLORS, MOCK_SNIPPETS, SPECIAL_ICON_URL } from './constants';
import PodGrid from './components/PodGrid';
import BackboneStatus from './components/BackboneStatus';
import PromptEvolution from './components/PromptEvolution';
import ControlPanel from './components/ControlPanel';
import PiecesOSContext from './components/PiecesOSContext';
import EvolutionTimeline from './components/EvolutionTimeline';
import { loadSecure, saveSecure } from './secureStorage';

// Parse <thinking>...</thinking> from model responses (deepseek-r1 style or explicit prompt style)
function parseThinking(raw: string): { thinking: string; answer: string } {
  const match = raw.match(/<think(?:ing)?>([\s\S]*?)<\/think(?:ing)?>/i);
  if (match) {
    const thinking = match[1].trim();
    const answer = raw.replace(/<think(?:ing)?>([\s\S]*?)<\/think(?:ing)?>/gi, '').trim();
    return { thinking, answer };
  }
  return { thinking: '', answer: raw };
}

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
  const [isEvolving, setIsEvolving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [architectAlert, setArchitectAlert] = useState<{ podName: string; text: string } | null>(null);

  // Settings state — encrypted via SubtleCrypto; async-loaded on mount below.
  const defaultSettings = {
    backboneIP: '',
    backbonePort: '11434',
    backboneModel: '',
    maxTurns: 10,
    geminiApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    grokApiKey: '',
  };
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsDraft, setSettingsDraft] = useState(defaultSettings);

  // Async decrypt on mount (~3ms); first render uses defaultSettings.
  // Also auto-migrates any existing plain-text v1 entry to encrypted v2.
  useEffect(() => {
    loadSecure(defaultSettings).then(loaded => {
      setSettings(loaded);
      setSettingsDraft(loaded);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire-and-forget AES-GCM encrypt on every settings commit.
  useEffect(() => {
    saveSecure(settings).catch(() => {});
  }, [settings]);

  // Agent Selection State
  const [agent1, setAgent1] = useState<AgentType>(AgentType.GEMINI);
  const [agent2, setAgent2] = useState<AgentType>(AgentType.CLAUDE);

  const [backbone, setBackbone] = useState<BackboneState>({
    address: settings.backboneIP,
    status: 'Online',
    model: settings.backboneModel,
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

  // Auto-open settings on first load if backbone is not configured
  useEffect(() => {
    if (!settings.backboneIP) {
      setSettingsDraft(settings);
      setShowSettings(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateContract = useCallback((updates: Partial<PromptContract>) => {
    setContract(prev => ({ ...prev, ...updates, lastUpdated: Date.now() }));
    if (updates.githubRepo) {
      addLog(`MAESTRO: Contract context updated via GitHub repo: ${updates.githubRepo}`);
    } else if (updates.googleSheetUrl) {
      addLog(`MAESTRO: Live orchestration linked to Google Sheet / Apps Script.`);
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

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch model list from a specific Ollama endpoint
  const fetchModels = async (ip: string, port: string): Promise<string[]> => {
    const res = await fetch(`http://${ip}:${port}/api/tags`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.models || []).map((m: { name: string }) => m.name);
  };

  const testConnection = async () => {
    if (!settingsDraft.backboneIP) return;
    setTestStatus('testing');
    try {
      const models = await fetchModels(settingsDraft.backboneIP, settingsDraft.backbonePort);
      setAvailableModels(models);
      // Auto-select first model if none chosen yet
      if (!settingsDraft.backboneModel && models.length > 0) {
        setSettingsDraft(p => ({ ...p, backboneModel: models[0] }));
      }
      addLog(`BACKBONE_TEST: Connected ✓ — ${models.length} model(s): ${models.slice(0, 4).join(', ')}`);
      setTestStatus('ok');
    } catch (e) {
      setTestStatus('fail');
      setAvailableModels([]);
      addLog(`BACKBONE_TEST: Cannot reach ${settingsDraft.backboneIP}:${settingsDraft.backbonePort} — Is Ollama running?`);
    }
  };

  // LAN scanner — tries common local addresses to auto-discover Ollama
  const scanForBackbone = async () => {
    setIsScanning(true);
    setTestStatus('idle');
    addLog('BACKBONE_SCAN: Scanning local network for Ollama...');
    // localhost first (fastest), then LAN ranges (DHCP changes between sessions)
    const candidates = [
      'localhost',        // ← Windows Ollama runs here by default
      '127.0.0.1',
      '192.168.0.241',   // ← your known backbone address
      '192.168.0.100', '192.168.0.200',
      '192.168.1.100', '192.168.1.200',
      '10.0.0.100', '10.0.0.200',
    ];
    let found = false;
    for (const ip of candidates) {
      try {
        const models = await fetchModels(ip, settingsDraft.backbonePort);
        setSettingsDraft(p => ({ ...p, backboneIP: ip, backboneModel: p.backboneModel || models[0] || '' }));
        setAvailableModels(models);
        setTestStatus('ok');
        addLog(`BACKBONE_SCAN: ✓ Found Ollama at ${ip} — ${models.length} model(s): ${models.slice(0, 4).join(', ')} ${models.includes('sovereign-maestro:latest') ? '| ⚡ sovereign-maestro ready' : ''}`);
        found = true;
        break;
      } catch { /* try next */ }
    }
    if (!found) {
      setTestStatus('fail');
      addLog('BACKBONE_SCAN: No Ollama found on common addresses. Enter IP manually and click Test.');
    }
    setIsScanning(false);
  };

  const saveSettings = () => {
    setSettings(settingsDraft);
    setBackbone(prev => ({
      ...prev,
      address: settingsDraft.backboneIP,
      model: settingsDraft.backboneModel,
    }));
    addLog(`SETTINGS: Backbone configured → ${settingsDraft.backboneIP} | model: ${settingsDraft.backboneModel}`);
    setTestStatus('idle');
    setShowSettings(false);
  };

  const evolveContract = async () => {
    setIsEvolving(true);
    addLog(`EVOLVE: Sending contract to backbone (${settings.backboneIP})...`);
    try {
      const evolved = await callBackbone(
        'You are a prompt engineer specializing in multi-agent AI orchestration. Return ONLY the improved prompt, no preamble or explanation.',
        `Improve this AI orchestration prompt contract into a single, more powerful 1-2 sentence directive:\n\nCurrent: "${contract.basePrompt}"\nConstraints: ${contract.constraints.join(', ')}`
      );
      setContract(prev => ({
        ...prev,
        basePrompt: evolved,
        version: prev.version + 1,
        evolutionScore: Math.min(10, prev.evolutionScore + 0.3),
        lastUpdated: Date.now(),
      }));
      addLog(`EVOLVE_SUCCESS: Contract upgraded to V${contract.version + 1}`);
    } catch (error) {
      addLog(`EVOLVE_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEvolving(false);
    }
  };

  const callBackbone = useCallback(async (systemPrompt: string, userPrompt: string): Promise<string> => {
    if (!settings.backboneIP || !settings.backboneModel) {
      throw new Error('Backbone not configured — open Settings and enter your Ollama IP and model name.');
    }
    const res = await fetch(`http://${settings.backboneIP}:${settings.backbonePort}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.backboneModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false
      })
    });
    if (!res.ok) throw new Error(`Backbone error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.message?.content?.trim() || '...';
  }, [settings.backboneIP, settings.backbonePort, settings.backboneModel]);

  // ── Cloud API callers ──────────────────────────────────────────────────────
  const callGemini = useCallback(async (systemPrompt: string, userPrompt: string): Promise<string> => {
    if (!settings.geminiApiKey) throw new Error('Gemini API key not set — open Settings');
    const genai = new GoogleGenAI({ apiKey: settings.geminiApiKey });
    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: systemPrompt },
      contents: userPrompt,
    });
    return response.text ?? '...';
  }, [settings.geminiApiKey]);

  const callOpenAI = useCallback(async (systemPrompt: string, userPrompt: string, model = 'gpt-4o'): Promise<string> => {
    if (!settings.openaiApiKey) throw new Error('OpenAI API key not set — open Settings');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.openaiApiKey}` },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '...';
  }, [settings.openaiApiKey]);

  const callAnthropic = useCallback(async (systemPrompt: string, userPrompt: string): Promise<string> => {
    if (!settings.anthropicApiKey) throw new Error('Anthropic API key not set — open Settings');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? '...';
  }, [settings.anthropicApiKey]);

  const callGrok = useCallback(async (systemPrompt: string, userPrompt: string): Promise<string> => {
    if (!settings.grokApiKey) throw new Error('Grok API key not set — open Settings');
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.grokApiKey}` },
      body: JSON.stringify({ model: 'grok-3', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }),
    });
    if (!res.ok) throw new Error(`Grok ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '...';
  }, [settings.grokApiKey]);

  // Routes to the correct cloud API (or backbone for local agents)
  const callAgent = useCallback(async (agentType: AgentType, systemPrompt: string, userPrompt: string): Promise<string> => {
    switch (agentType) {
      case AgentType.GEMINI:    return callGemini(systemPrompt, userPrompt);
      case AgentType.CHATGPT:   return callOpenAI(systemPrompt, userPrompt);
      case AgentType.COPILOT:   return callOpenAI(systemPrompt, userPrompt);
      case AgentType.CLAUDE:    return callAnthropic(systemPrompt, userPrompt);
      case AgentType.GROK:      return callGrok(systemPrompt, userPrompt);
      case AgentType.LOCAL_LLM: return callBackbone(systemPrompt, userPrompt);
      case AgentType.PIECES_OS: return callBackbone(systemPrompt, userPrompt);
      default:                  return callBackbone(systemPrompt, userPrompt);
    }
  }, [callGemini, callOpenAI, callAnthropic, callGrok, callBackbone]);

  const sendMessageToPod = useCallback(async (podId: string, text: string) => {
    // Snapshot pod state before any async ops
    const pod = pods.find(p => p.id === podId);
    if (!pod) return;

    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', text, timestamp: Date.now() };
    const baseMessages = [...pod.messages, userMsg];
    // Difficulty escalates with each turn (1-10)
    const currentDifficulty = Math.max(1, Math.min(10, Math.floor(pod.messages.length / 3) + 1));

    setPods(prev => prev.map(p => p.id === podId
      ? { ...p, messages: baseMessages, isAwaitingReply: true, status: PodStatus.RUNNING, needsArchitect: false }
      : p
    ));
    addLog(`[${pod.name}] Architect injects: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    try {
      // ── TURN 1: Agent A (cloud model) responds to Architect ──────────
      const rawA = await callAgent(
        pod.agents[0],
        `Work through this problem step by step. Show your full reasoning inside <thinking>...</thinking> tags, then give your conclusion after. The reasoning chain matters more than the final answer — show every step. If you need human judgment or are genuinely stuck, include the word "Architect".`,
        `${text}\n\n(Run ${pod.runCount + 1} · Difficulty ${currentDifficulty}/10 — show full reasoning chain):`
      );
      const { thinking: thinkingA, answer: answerA } = parseThinking(rawA);

      const calledForArchitectA = rawA.toLowerCase().includes('architect');
      if (calledForArchitectA) setArchitectAlert({ podName: pod.name, text: answerA });

      // Backbone: reasoning quality check — did they show their work?
      let scoreA = 75;
      try {
        const raw = await callBackbone(
          'Rate the reasoning quality 0-100: high = clear step-by-step thinking that shows HOW the conclusion was reached; low = bare assertion with no reasoning shown or skipped steps. Reply ONLY with a single integer.',
          `Problem: "${text}"\nReasoning shown: "${(thinkingA || answerA).substring(0, 600)}"\nScore:`
        );
        scoreA = Math.min(100, Math.max(0, parseInt(raw.match(/\d+/)?.[0] || '75')));
      } catch { /* use default 75 */ }

      const msgA: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: pod.agents[0],
        text: answerA,
        thinking: thinkingA,
        timestamp: Date.now(),
        difficulty: currentDifficulty,
        reasoningScore: scoreA,
        runNumber: pod.runCount + 1,
      };

      // Backbone: generate the hardest follow-up question (keeps them on track)
      const nextDifficulty = Math.min(10, currentDifficulty + 1);
      let nextQuestion = `${pod.agents[1]}, respond to what ${pod.agents[0]} said and advance the research further.`;
      try {
        nextQuestion = await callBackbone(
          `You are a Socratic research examiner. Your job is to generate the single most probing, difficult follow-up question that exposes gaps or pushes the research further. Output ONLY the question — no preamble, no explanation.`,
          `Topic: "${text}"\n${pod.agents[0]} said: "${answerA.substring(0, 400)}"\n\nHardest follow-up for ${pod.agents[1]} (difficulty ${nextDifficulty}/10):`
        );
      } catch { /* use default */ }

      const backboneMsg: ChatMessage = {
        id: `msg-${Date.now()}-bb`,
        role: 'backbone',
        text: nextQuestion,
        timestamp: Date.now(),
        isExaminerQuestion: true,
        difficulty: nextDifficulty,
      };

      const messagesAfterA = [...baseMessages, msgA, backboneMsg];
      setPods(prev => prev.map(p => p.id === podId
        ? { ...p, messages: messagesAfterA, lastMessage: answerA, isAwaitingReply: true, needsArchitect: calledForArchitectA }
        : p
      ));
      addLog(`[${pod.name}] ${pod.agents[0]} reasoning: ${scoreA}% | "${answerA.substring(0, 55)}..."`);

      // ── TURN 2: Agent B (cloud model) responds to Examiner's question ─
      const rawB = await callAgent(
        pod.agents[1],
        `A prior response was given. Now you face a harder follow-up. Show your full reasoning inside <thinking>...</thinking> tags, then give your conclusion. Show every step — the path matters more than the destination. Include "Architect" if you need human judgment.`,
        `Previous response: "${answerA.substring(0, 300)}"\n\nFollow-up challenge: ${nextQuestion}\n\n(Run ${pod.runCount + 1} · Difficulty ${nextDifficulty}/10 — show full reasoning chain):`
      );
      const { thinking: thinkingB, answer: answerB } = parseThinking(rawB);

      const calledForArchitectB = rawB.toLowerCase().includes('architect');
      if (calledForArchitectB) setArchitectAlert({ podName: pod.name, text: answerB });

      let scoreB = 75;
      try {
        const raw = await callBackbone(
          'Rate reasoning quality 0-100: high = clear step-by-step thinking showing HOW the conclusion was reached; low = skipped steps or bare assertion. Reply ONLY with a single integer.',
          `Problem: "${nextQuestion}"\nReasoning shown: "${(thinkingB || answerB).substring(0, 600)}"\nScore:`
        );
        scoreB = Math.min(100, Math.max(0, parseInt(raw.match(/\d+/)?.[0] || '75')));
      } catch { /* use default 75 */ }

      const msgB: ChatMessage = {
        id: `msg-${Date.now()}-b`,
        role: pod.agents[1],
        text: answerB,
        thinking: thinkingB,
        timestamp: Date.now(),
        difficulty: nextDifficulty,
        reasoningScore: scoreB,
        runNumber: pod.runCount + 1,
      };

      const finalMessages = [...messagesAfterA, msgB];
      const avgReasoning = (scoreA + scoreB) / 2;
      const needsHelp = calledForArchitectA || calledForArchitectB;

      setPods(prev => prev.map(p => p.id === podId
        ? {
            ...p,
            messages: finalMessages,
            lastMessage: answerB,
            isAwaitingReply: false,
            needsArchitect: needsHelp,
            signalStrength: Math.round((p.signalStrength + avgReasoning) / 2),
            currentTurn: p.currentTurn + 1,
            runCount: p.runCount + 1,
          }
        : p
      ));
      addLog(`[${pod.name}] ${pod.agents[1]} reasoning: ${scoreB}% | run #${pod.runCount + 1}`);
      if (needsHelp) addLog(`[${pod.name}] ⚡ ARCHITECT NEEDED — pod going RED`);
      if (avgReasoning < 55) addLog(`[${pod.name}] ⚠ Reasoning quality ${Math.round(avgReasoning)}% — pod going YELLOW`);

    } catch (err) {
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: pod.agents[0],
        text: `Backbone error: ${err instanceof Error ? err.message : 'Check Ollama at ' + settings.backboneIP}`,
        timestamp: Date.now(),
        reasoningScore: 0,
      };
      setPods(prev => prev.map(p => p.id === podId
        ? { ...p, messages: [...p.messages, errMsg], isAwaitingReply: false, status: PodStatus.ERROR }
        : p
      ));
      addLog(`[BACKBONE_ERROR] ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }, [pods, settings, addLog, callBackbone, callAgent]);

  // Export all crowned reasoning paths as a JSON training dataset (Phase 2 input)
  const exportCrownedPaths = useCallback(() => {
    const crowned = pods.flatMap(pod =>
      pod.messages
        .filter(m => m.isCrowned)
        .map(m => {
          // Find the user prompt that preceded this message
          const precedingUser = [...pod.messages]
            .reverse()
            .find(prev => prev.role === 'user' && prev.timestamp <= m.timestamp);
          return {
            // Fine-tune / RLHF compatible format
            instruction: 'Reason through this problem step by step, exposing every inference step inside <thinking> tags, then deliver your conclusion.',
            input: precedingUser?.text ?? '',
            output: m.text,
            thinking: m.thinking ?? '',
            // Rich metadata for Phase 2 vectorization
            meta: {
              pod: pod.name,
              agents: pod.agents,
              model: m.role,
              difficulty: m.difficulty ?? 1,
              reasoningScore: m.reasoningScore ?? 0,
              runNumber: m.runNumber ?? 1,
              timestamp: m.timestamp,
              contractVersion: contract.version,
            },
          };
        })
    );

    if (crowned.length === 0) {
      addLog('EXPORT: No crowned paths yet — hit ⭐ on the best responses to mark them first.');
      return;
    }

    const json = JSON.stringify(crowned, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantizer-dataset-v${contract.version}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog(`EXPORT: ✓ ${crowned.length} crowned reasoning path${crowned.length === 1 ? '' : 's'} → quantizer-dataset-v${contract.version}.json`);
  }, [pods, contract.version, addLog]);

  // Crown a specific message as the winning response → feeds the pattern brain
  const handleCrownMessage = useCallback((podId: string, messageId: string) => {
    setPods(prev => prev.map(p => {
      if (p.id !== podId) return p;
      const crowned = p.messages.find(m => m.id === messageId);
      if (!crowned) return p;
      addLog(`⭐ CROWNED [${p.name}]: "${crowned.text.substring(0, 60)}..." → Pattern logged to contract.`);
      return {
        ...p,
        signalStrength: Math.min(100, p.signalStrength + 10),
        messages: p.messages.map(m => ({ ...m, isCrowned: m.id === messageId })),
      };
    }));
  }, [addLog]);

  // Broadcast to ALL pods at once
  const broadcastToAllPods = useCallback((text: string) => {
    pods.forEach(pod => sendMessageToPod(pod.id, text));
  }, [pods, sendMessageToPod]);

  const runGlobalSynthesis = async () => {
    addLog(`Initiating Global Neural Synthesis via backbone (${settings.backboneIP})...`);
    try {
      const activeThoughts = pods
        .map(p => p.lastMessage)
        .filter(msg => msg && msg.length > 0)
        .join("\n- ");

      const synthesis = await callBackbone(
        'You are a research synthesis engine. Analyze parallel AI thought streams and distill breakthrough insights into a single concise sentence.',
        `Synthesize the top insight from these parallel research streams:\n- ${activeThoughts}`
      );

      addLog(`BACKBONE_SYNTHESIS: ${synthesis}`);
      setBackbone(prev => ({
        ...prev,
        synthesizedInsights: [
          `Local Synthesis: ${synthesis.substring(0, 70)}...`,
          ...prev.synthesizedInsights.slice(0, 5)
        ]
      }));
    } catch (error) {
      addLog(`Synthesis Error: ${error instanceof Error ? error.message : "Backbone unreachable"}`);
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
      maxTurns: settings.maxTurns,
      signalStrength: 0,
      url: `https://node-${pods.length + 1}.quantizer.ai/live`,
      partnerThoughts: {},
      messages: [],
      runCount: 0,
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

      {/* Architect Alert */}
      {architectAlert && (
        <div className="fixed top-24 right-6 z-[300] max-w-sm bg-amber-950 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl shadow-amber-900/50 animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">⚡ ARCHITECT — You're needed in {architectAlert.podName}</div>
              <p className="text-xs text-amber-200 leading-relaxed">"{architectAlert.text.substring(0, 120)}{architectAlert.text.length > 120 ? '...' : ''}"</p>
            </div>
            <button onClick={() => setArchitectAlert(null)} className="text-amber-600 hover:text-amber-400 shrink-0"><X size={16} /></button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-200">
                  <Settings size={16} className="text-blue-400" /> Backbone Configuration
                </h2>
                {!settings.backboneIP && (
                  <p className="text-[10px] text-amber-400 font-mono mt-0.5">⚡ First-run setup — configure your local Ollama backbone to begin.</p>
                )}
              </div>
              <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-hide">
              {/* Backbone IP + LAN Scanner */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Backbone IP Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsDraft.backboneIP}
                    onChange={(e) => { setSettingsDraft(p => ({ ...p, backboneIP: e.target.value })); setTestStatus('idle'); setAvailableModels([]); }}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                    placeholder="e.g. 192.168.0.241 — or hit Scan"
                  />
                  <button
                    onClick={scanForBackbone}
                    disabled={isScanning}
                    title="Auto-scan common local addresses for Ollama"
                    className="px-3 py-2 bg-slate-800 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500/50 rounded-lg text-[10px] font-bold text-slate-400 hover:text-blue-300 transition-all disabled:opacity-40 whitespace-nowrap flex items-center gap-1.5"
                  >
                    {isScanning
                      ? <><RefreshCcw size={11} className="animate-spin" /> Scanning...</>
                      : <><Activity size={11} /> Scan LAN</>}
                  </button>
                </div>
                {testStatus === 'ok' && settingsDraft.backboneIP && (
                  <p className="text-[9px] text-emerald-400 font-mono">✓ Reachable at {settingsDraft.backboneIP}:{settingsDraft.backbonePort}</p>
                )}
              </div>

              {/* Backbone Model — dropdown when models are fetched, text input otherwise */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Backbone Model</label>
                  {availableModels.length > 0 && (
                    <button
                      onClick={testConnection}
                      className="text-[9px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
                      title="Re-fetch model list from Ollama"
                    >
                      <RefreshCcw size={9} /> Refresh
                    </button>
                  )}
                </div>
                {availableModels.length > 0 ? (
                  <select
                    value={settingsDraft.backboneModel}
                    onChange={(e) => setSettingsDraft(p => ({ ...p, backboneModel: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors cursor-pointer"
                  >
                    {availableModels.map(m => (
                      <option key={m} value={m} className="bg-slate-900">{m}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settingsDraft.backboneModel}
                      onChange={(e) => setSettingsDraft(p => ({ ...p, backboneModel: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                      placeholder="e.g. qwen2.5:7b — Scan or Test to auto-populate"
                    />
                  </div>
                )}
                {availableModels.length > 0 && (
                  <p className="text-[9px] text-slate-600">{availableModels.length} model{availableModels.length !== 1 ? 's' : ''} installed on this backbone</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Backbone Port</label>
                  <input
                    type="text"
                    value={settingsDraft.backbonePort ?? '11434'}
                    onChange={(e) => setSettingsDraft(p => ({ ...p, backbonePort: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                    placeholder="11434"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Turns / Pod</label>
                  <input
                    type="number"
                    value={settingsDraft.maxTurns}
                    onChange={(e) => setSettingsDraft(p => ({ ...p, maxTurns: parseInt(e.target.value) || 10 }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                    min={1} max={100}
                  />
                </div>
              </div>

              {/* ── Cloud API Keys ─────────────────────────────────────── */}
              <div className="border-t border-slate-800 pt-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">☁ Cloud API Keys — Pod Agents</p>
                <p className="text-[9px] text-slate-600 mb-3">Each pod routes to the matching cloud API. Backbone (Ollama) is still used for scoring + follow-ups — zero cloud waste.</p>
                {/* Quick status row — which APIs are configured */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {[
                    { label: 'Gemini', key: settingsDraft.geminiApiKey, color: 'bg-blue-400' },
                    { label: 'OpenAI', key: settingsDraft.openaiApiKey, color: 'bg-green-400' },
                    { label: 'Anthropic', key: settingsDraft.anthropicApiKey, color: 'bg-orange-400' },
                    { label: 'Grok', key: settingsDraft.grokApiKey, color: 'bg-purple-400' },
                  ].map(({ label, key, color }) => (
                    <span key={label} className={`flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full border ${key ? 'border-slate-700 text-slate-300' : 'border-slate-800 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${key ? color : 'bg-slate-700'}`}></span>
                      {label}
                    </span>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsDraft.geminiApiKey ? 'bg-blue-400' : 'bg-slate-700'}`}></span>
                      Gemini <span className="text-slate-600 normal-case font-normal">(gemini-2.0-flash)</span>
                    </label>
                    <input
                      type="password"
                      value={settingsDraft.geminiApiKey}
                      onChange={(e) => setSettingsDraft(p => ({ ...p, geminiApiKey: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                      placeholder="AIza..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsDraft.openaiApiKey ? 'bg-green-400' : 'bg-slate-700'}`}></span>
                      OpenAI <span className="text-slate-600 normal-case font-normal">(gpt-4o · Copilot)</span>
                    </label>
                    <input
                      type="password"
                      value={settingsDraft.openaiApiKey}
                      onChange={(e) => setSettingsDraft(p => ({ ...p, openaiApiKey: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-orange-500/70 uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsDraft.anthropicApiKey ? 'bg-orange-400' : 'bg-slate-700'}`}></span>
                      Anthropic <span className="text-slate-600 normal-case font-normal">(claude-sonnet-4-5)</span>
                    </label>
                    <input
                      type="password"
                      value={settingsDraft.anthropicApiKey}
                      onChange={(e) => setSettingsDraft(p => ({ ...p, anthropicApiKey: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                      placeholder="sk-ant-..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-purple-500/70 uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsDraft.grokApiKey ? 'bg-purple-400' : 'bg-slate-700'}`}></span>
                      Grok <span className="text-slate-600 normal-case font-normal">(grok-3)</span>
                    </label>
                    <input
                      type="password"
                      value={settingsDraft.grokApiKey}
                      onChange={(e) => setSettingsDraft(p => ({ ...p, grokApiKey: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm font-mono text-slate-200 outline-none transition-colors"
                      placeholder="xai-..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex items-center justify-between gap-3">
              <button
                onClick={testConnection}
                disabled={!settingsDraft.backboneIP || testStatus === 'testing'}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs flex items-center gap-2 transition-colors font-mono"
              >
                {testStatus === 'testing' && <span className="text-yellow-400 animate-pulse">⏳ Testing...</span>}
                {testStatus === 'ok' && <span className="text-emerald-400">✓ Reachable</span>}
                {testStatus === 'fail' && <span className="text-red-400">✗ Unreachable</span>}
                {testStatus === 'idle' && <span className="text-slate-400">Test Connection</span>}
              </button>
              <div className="flex gap-3">
                <button onClick={() => { setShowSettings(false); setTestStatus('idle'); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-400 transition-colors">Cancel</button>
                <button onClick={saveSettings} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white font-bold flex items-center gap-2 transition-colors">
                  <Save size={13} /> Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <Link
            to="/timeline"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-md text-[10px] font-bold transition-colors hover:text-blue-400 hover:border-blue-500/50"
          >
            <LineChart size={14} />
            TIMELINE
          </Link>

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
            onClick={exportCrownedPaths}
            title="Export all ⭐ crowned reasoning paths as a JSON training dataset"
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 rounded-md text-[10px] font-bold transition-colors hover:bg-emerald-600/40"
          >
            <Database size={14} />
            EXPORT DATASET
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
            onClick={() => { setSettingsDraft(settings); setShowSettings(true); setTestStatus('idle'); setAvailableModels([]); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors border relative ${!settings.backboneIP ? 'bg-amber-950/40 text-amber-400 border-amber-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
          >
            <Settings size={14} />
            SETTINGS
            {!settings.backboneIP && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"></span>}
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
            
            {/* Broadcast Bar */}
            <BroadcastBar onBroadcast={broadcastToAllPods} podCount={pods.length} />

            <PodGrid
              pods={pods}
              onSync={handleSyncToBackbone}
              onRemove={handleRemovePod}
              onSendMessage={sendMessageToPod}
              onCrownMessage={handleCrownMessage}
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
          <PromptEvolution contract={contract} onUpdate={handleUpdateContract} onEvolve={evolveContract} isEvolving={isEvolving} />
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

const BroadcastBar: React.FC<{ onBroadcast: (text: string) => void; podCount: number }> = ({ onBroadcast, podCount }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onBroadcast(trimmed);
    setInput('');
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/80 border border-amber-500/20 rounded-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">ARCHITECT BROADCAST</span>
        <span className="text-[9px] text-slate-600 font-mono">→ all {podCount} pods</span>
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        placeholder='Inject a message or repo to all pods... (e.g. "analyze FnBrian79/MYthOS")'
        className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-700 font-mono"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim()}
        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        <Rocket size={12} /> BROADCAST
      </button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/timeline" element={<EvolutionTimeline />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
