
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'backbone' | AgentType;
  text: string;                  // The final answer / conclusion
  thinking?: string;             // The reasoning chain (how they got there) — THIS is what we track
  timestamp: number;
  reasoningScore?: number;       // 0-100: reasoning quality (backbone-evaluated), NOT answer quality
  difficulty?: number;           // 1-10: escalating difficulty level
  isExaminerQuestion?: boolean;  // true = backbone-generated follow-up question
  isCrowned?: boolean;           // Architect marked this reasoning path as the winner
  runNumber?: number;            // Which run of the current prompt this came from
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
  signalStrength: number;        // 0-100 overall quality score
  url?: string;                  // Virtual address for the browser node
  messages: ChatMessage[];
  isAwaitingReply?: boolean;
  needsArchitect?: boolean;      // Agent called for Architect — pod goes RED
  runCount: number;              // How many runs on the current prompt topic
}

export interface PromptContract {
  id: string;
  version: number;
  basePrompt: string;
  constraints: string[];
  examples: string[];
  evolutionScore: number;
  lastUpdated: number;
  githubRepo?: string; // The orchestration maestro source
  googleSheetUrl?: string; // Google Apps Script Maestro source
}

export interface BackboneState {
  address: string;
  status: 'Online' | 'Offline' | 'Processing';
  model: string;
  memoryUsage: string;
  activeThreads: number;
  synthesizedInsights: string[];
}
