import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

class SessionService {
  private sessions: Map<string, ChatCompletionMessageParam[]> = new Map();

  getHistory(sessionId: string): ChatCompletionMessageParam[] {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    return this.sessions.get(sessionId)!;
  }

  addMessage(sessionId: string, message: ChatCompletionMessageParam): void {
    const history = this.getHistory(sessionId);
    history.push(message);
  }

  addMessages(sessionId: string, messages: ChatCompletionMessageParam[]): void {
    const history = this.getHistory(sessionId);
    history.push(...messages);
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const sessionService = new SessionService();
