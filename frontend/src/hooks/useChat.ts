import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage as sendChatMessage } from '../services/api';
import type { Message } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(() => uuidv4());
  const [employeeId, setEmployeeId] = useState('EMP001');

  const changeEmployee = useCallback((newEmployeeId: string) => {
    setEmployeeId(newEmployeeId);
    setMessages([]);
    setSessionId(uuidv4());
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage({
          sessionId,
          employeeId,
          message: trimmed,
        });

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.response,
          toolCalls: response.toolCalls.length > 0 ? response.toolCalls : undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, employeeId],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(uuidv4());
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    employeeId,
    changeEmployee,
    sendMessage,
    clearChat,
  };
}
