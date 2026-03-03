import { useChat } from './hooks/useChat';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const {
    messages,
    isLoading,
    error,
    employeeId,
    setEmployeeId,
    sendMessage,
    clearChat,
  } = useChat();

  return (
    <div className="app">
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        error={error}
        employeeId={employeeId}
        onEmployeeChange={setEmployeeId}
        onSend={sendMessage}
        onClear={clearChat}
      />
    </div>
  );
}
