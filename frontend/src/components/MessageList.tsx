import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="message-list">
        <div className="welcome-container">
          <div className="welcome-icon">{'\u{1F334}'}</div>
          <h2 className="welcome-title">Welcome to HR Assistant</h2>
          <p className="welcome-subtitle">
            I can help you with time off and HR questions. Try asking:
          </p>
          <div className="welcome-suggestions">
            <div className="suggestion-chip">
              {'\u{1F4C6}'} How many vacation days do I have?
            </div>
            <div className="suggestion-chip">
              {'\u{1F3D6}\u{FE0F}'} I'd like to request time off next week
            </div>
            <div className="suggestion-chip">
              {'\u{1F4CB}'} What's the company vacation policy?
            </div>
            <div className="suggestion-chip">
              {'\u{1F465}'} Who on my team is off this month?
            </div>
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="message-row message-row-assistant">
          <div className="avatar avatar-assistant">AI</div>
          <div className="message-bubble bubble-assistant">
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
