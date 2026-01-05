
export enum AgentType {
  GEMINI = 'Gemini',
  GROK = 'Grok',
  CLAUDE = 'Claude',
  CHATGPT = 'ChatGPT',
  COPILOT = 'Copilot',
  LOCAL_LLM = 'LocalLLM',
  PIECES_OS = 'PiecesOS'
}

export enum PodStatus {
  IDLE = 'Idle',
  RUNNING = 'Running',
  SYNCING = 'Syncing',
  ERROR = 'Error'
}

export interface ContextSnippet {
  id: string;
  content: string;
  source: string;
  timestamp: number;
  relevance: number;
}

export interface Message {
  id: string;
  sender: AgentType;
  text: string;
  timestamp: number;
}

export interface ConversationPod {
  id: string;
  name: string;
  agents: [AgentType, AgentType];
  status: PodStatus;
  currentTurn: number;
  maxTurns: number;
  lastMessage?: string;
  partnerThoughts?: {
    [key in AgentType]?: string;
  };
  signalStrength: number; // 0-100 score of insight quality
  url?: string; // Virtual address for the browser node
}

export interface PromptContract {
  id: string;
  version: number;
  basePrompt: string;
  constraints: string[];
  examples: string[];
  evolutionScore: number;
  lastUpdated: number;
}

export interface BackboneState {
  address: string;
  status: 'Online' | 'Offline' | 'Processing';
  model: string;
  memoryUsage: string;
  activeThreads: number;
  synthesizedInsights: string[];
}
