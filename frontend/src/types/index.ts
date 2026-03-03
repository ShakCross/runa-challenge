export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
  timestamp: Date;
}

export interface ToolCallInfo {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface ChatRequest {
  sessionId: string;
  employeeId: string;
  message: string;
}

export interface ChatResponse {
  response: string;
  toolCalls: ToolCallInfo[];
}
