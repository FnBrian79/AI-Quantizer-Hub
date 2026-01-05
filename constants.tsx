
import React from 'react';
import { AgentType, PodStatus, ConversationPod, PromptContract, ContextSnippet } from './types';
import { Bot, Cpu, Zap, Globe, Shield, Terminal, Link2 } from 'lucide-react';

export const INITIAL_PODS: ConversationPod[] = [
  { id: 'pod-1', name: 'Browser-01', agents: [AgentType.GEMINI, AgentType.GROK], status: PodStatus.RUNNING, currentTurn: 4, maxTurns: 10, lastMessage: 'Analyzing quantum tunneling patterns...', signalStrength: 82, url: 'https://node-01.quantizer.ai/session' },
  { id: 'pod-2', name: 'Browser-02', agents: [AgentType.CLAUDE, AgentType.GEMINI], status: PodStatus.RUNNING, currentTurn: 7, maxTurns: 10, lastMessage: 'Retrieving superconductor lattice context...', signalStrength: 91, url: 'https://node-02.quantizer.ai/research' },
  { id: 'pod-3', name: 'Browser-03', agents: [AgentType.CHATGPT, AgentType.CLAUDE], status: PodStatus.IDLE, currentTurn: 0, maxTurns: 10, signalStrength: 0, url: 'https://node-03.quantizer.ai/idle' },
  { id: 'pod-4', name: 'Browser-04', agents: [AgentType.COPILOT, AgentType.GROK], status: PodStatus.ERROR, currentTurn: 2, maxTurns: 10, signalStrength: 45, url: 'https://node-04.quantizer.ai/crash-log' },
  { id: 'pod-5', name: 'Browser-05', agents: [AgentType.GEMINI, AgentType.COPILOT], status: PodStatus.SYNCING, currentTurn: 10, maxTurns: 10, signalStrength: 88, url: 'https://node-05.quantizer.ai/sync' },
  { id: 'pod-6', name: 'Browser-06', agents: [AgentType.LOCAL_LLM, AgentType.GEMINI], status: PodStatus.RUNNING, currentTurn: 3, maxTurns: 10, lastMessage: 'Indexing local vector database shards...', signalStrength: 76, url: 'https://node-06.quantizer.ai/db' },
  { id: 'pod-7', name: 'Browser-07', agents: [AgentType.PIECES_OS, AgentType.CLAUDE], status: PodStatus.RUNNING, currentTurn: 5, maxTurns: 10, lastMessage: 'Capturing semantic snippets for LTM...', signalStrength: 95, url: 'https://node-07.quantizer.ai/pieces-sync' },
  { id: 'pod-8', name: 'Browser-08', agents: [AgentType.GROK, AgentType.CHATGPT], status: PodStatus.IDLE, currentTurn: 0, maxTurns: 10, signalStrength: 0, url: 'https://node-08.quantizer.ai/standby' },
  { id: 'pod-9', name: 'Browser-09', agents: [AgentType.GEMINI, AgentType.PIECES_OS], status: PodStatus.SYNCING, currentTurn: 9, maxTurns: 10, signalStrength: 84, url: 'https://node-09.quantizer.ai/upload' },
  { id: 'pod-10', name: 'Browser-10', agents: [AgentType.CLAUDE, AgentType.LOCAL_LLM], status: PodStatus.RUNNING, currentTurn: 1, maxTurns: 10, lastMessage: 'Initializing cross-node handshake...', signalStrength: 62, url: 'https://node-10.quantizer.ai/init' },
];

export const INITIAL_PROMPT_CONTRACT: PromptContract = {
  id: 'contract-v2',
  version: 5,
  basePrompt: 'Develop M2M prompt contracts for Multi-Agent Anti-Gravity Propulsion Systems.',
  constraints: [
    'Utilize Pieces OS context for long-term memory retrieval',
    'Synthesize Gemini and Grok insights on zero-point energy',
    'Efficiency must exceed the gravity-well threshold'
  ],
  examples: [
    'Model the flux pinning effects in high-temp superconductors',
    'Automate snippet capture via Pieces OS API'
  ],
  evolutionScore: 9.2,
  lastUpdated: Date.now()
};

export const MOCK_SNIPPETS: ContextSnippet[] = [
  { id: 'snip-1', content: 'Lattice constant mismatch in YBCO films leads to improved pinning forces.', source: 'Research Archives', timestamp: Date.now() - 50000, relevance: 0.94 },
  { id: 'snip-2', content: 'Anti-gravity bias can be simulated via asymmetric electrogravitic capacitors.', source: 'Node-Alpha Stream', timestamp: Date.now() - 120000, relevance: 0.88 },
  { id: 'snip-3', content: 'Pieces OS: Semantic sync confirmed for local Llama backbone.', source: 'Pieces OS Agent', timestamp: Date.now() - 200000, relevance: 0.99 }
];

export const AGENT_ICONS: Record<string, React.ReactNode> = {
  [AgentType.GEMINI]: <Zap size={16} className="text-blue-400" />,
  [AgentType.GROK]: <Terminal size={16} className="text-purple-400" />,
  [AgentType.CLAUDE]: <Shield size={16} className="text-orange-400" />,
  [AgentType.CHATGPT]: <Globe size={16} className="text-green-400" />,
  [AgentType.COPILOT]: <Cpu size={16} className="text-cyan-400" />,
  [AgentType.LOCAL_LLM]: <Bot size={16} className="text-pink-400" />,
  [AgentType.PIECES_OS]: <Link2 size={16} className="text-cyan-400" />
};

export const COLORS = {
  bg: '#020617',
  card: '#0f172a',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  pieces: '#06b6d4'
};
