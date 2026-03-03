import type { Message } from '../types';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const EMPLOYEES = [
  { id: 'EMP001', name: 'Alice Johnson' },
  { id: 'EMP002', name: 'Bob Smith' },
  { id: 'EMP003', name: 'Carol Williams' },
  { id: 'EMP004', name: 'Dave Brown' },
  { id: 'EMP005', name: 'Eve Davis' },
];

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  employeeId: string;
  onEmployeeChange: (id: string) => void;
  onSend: (message: string) => void;
  onClear: () => void;
}

export default function ChatWindow({
  messages,
  isLoading,
  error,
  employeeId,
  onEmployeeChange,
  onSend,
  onClear,
}: ChatWindowProps) {
  return (
    <div className="chat-window">
      <header className="chat-header">
        <div className="header-left">
          <h1 className="header-title">
            <span className="header-logo">{'\u{1F334}'}</span>
            HR Assistant
            <span className="header-subtitle">Time Off</span>
          </h1>
        </div>

        <div className="header-right">
          <select
            className="employee-select"
            value={employeeId}
            onChange={(e) => onEmployeeChange(e.target.value)}
          >
            {EMPLOYEES.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.id} &mdash; {emp.name}
              </option>
            ))}
          </select>

          <button className="reset-button" onClick={onClear} type="button" title="New conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">{'\u26A0\uFE0F'}</span>
          <span>{error}</span>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
