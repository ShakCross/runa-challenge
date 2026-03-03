import { useState, useCallback } from 'react';
import type { ToolCallInfo } from '../types';

const TOOL_ICONS: Record<string, string> = {
  getRemainingVacationDays: '\u{1F4CA}',
  requestTimeOff: '\u{1F3D6}\u{FE0F}',
  getCompanyPolicy: '\u{1F4CB}',
  getTeamCalendar: '\u{1F4C5}',
};

interface ToolCallBadgeProps {
  toolCall: ToolCallInfo;
}

export default function ToolCallBadge({ toolCall }: ToolCallBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const icon = TOOL_ICONS[toolCall.tool] ?? '\u{1F527}';

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <div className="tool-call-badge">
      <button className="tool-call-pill" onClick={toggle} type="button">
        <span className="tool-call-icon">{icon}</span>
        <span className="tool-call-name">{toolCall.tool}</span>
        <span className={`tool-call-chevron ${expanded ? 'expanded' : ''}`}>
          {'\u25B6'}
        </span>
      </button>

      {expanded && (
        <div className="tool-call-details">
          <div className="tool-call-section">
            <span className="tool-call-label">Arguments</span>
            <pre>{JSON.stringify(toolCall.args, null, 2)}</pre>
          </div>
          <div className="tool-call-section">
            <span className="tool-call-label">Result</span>
            <pre>{JSON.stringify(toolCall.result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
