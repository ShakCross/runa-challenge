import Markdown from 'react-markdown';
import type { Message } from '../types';
import ToolCallBadge from './ToolCallBadge';

interface MessageBubbleProps {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'message-row-user' : 'message-row-assistant'}`}>
      {!isUser && <div className="avatar avatar-assistant">AI</div>}

      <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
        <div className="message-content">
          {isUser ? message.content : <Markdown>{message.content}</Markdown>}
        </div>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="tool-calls-container">
            {message.toolCalls.map((tc, i) => (
              <ToolCallBadge key={`${tc.tool}-${i}`} toolCall={tc} />
            ))}
          </div>
        )}

        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>

      {isUser && <div className="avatar avatar-user">You</div>}
    </div>
  );
}
