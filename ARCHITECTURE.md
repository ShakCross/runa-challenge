# Architecture — HR Assistant Agent

This document describes the system design, data flow, and key tradeoffs behind the HR Assistant Agent for the Time Off Module.

## End-to-End Flow

```
┌──────────┐      POST /api/chat       ┌──────────────┐
│ Frontend │  ───────────────────────►  │  Express API │
│ (React)  │                            │   (Node.js)  │
│          │  ◄───────────────────────  │              │
└──────────┘      JSON response         └──────┬───────┘
                                               │
                                     ┌─────────▼─────────┐
                                     │  Session Service   │
                                     │  (load / create)   │
                                     └─────────┬─────────┘
                                               │
                                     ┌─────────▼─────────┐
                                     │   Agent Loop       │
                                     │                    │
                                     │  ┌──────────────┐  │
                                     │  │ Build prompt  │  │
                                     │  │ (system +     │  │
                                     │  │  history +    │  │
                                     │  │  user msg)    │  │
                                     │  └──────┬───────┘  │
                                     │         │          │
                                     │  ┌──────▼───────┐  │
                                     │  │  Call LLM    │◄─┤─── loop back
                                     │  │  (GPT-4o-    │  │    if tool_calls
                                     │  │   mini)      │  │
                                     │  └──────┬───────┘  │
                                     │         │          │
                                     │    tool_calls?     │
                                     │     ╱        ╲     │
                                     │   yes         no   │
                                     │   │            │   │
                                     │   ▼            ▼   │
                                     │ Execute     Return  │
                                     │ tools &     final   │
                                     │ append      text    │
                                     │ results     response│
                                     │   │                │
                                     │   └──► (loop) ─────┘
                                     └────────────────────┘
```

### Step-by-step

1. **User types a message** in the React chat UI.
2. The frontend sends a `POST /api/chat` request containing `sessionId`, `employeeId`, and the user's `message`.
3. The backend **loads or creates a session** — a conversation history array keyed by `sessionId`.
4. The user message is appended to the history.
5. The **agent loop** begins:
   - The full message array (system prompt + history) and tool definitions are sent to the OpenAI Chat Completions API.
   - If the model returns **tool_calls**, each call is executed against the corresponding service function. The tool results are appended to the conversation as `tool` role messages.
   - The loop **repeats** — the LLM sees the tool results and can issue more tool calls or produce a final answer.
   - When the model returns a plain **text response** (no tool_calls), the loop exits.
6. The final response and any tool-call metadata are sent back to the frontend.
7. The frontend renders the assistant message and optional tool-call badges.

This iterative loop means the agent can chain multiple tools in a single turn — for example, checking a team calendar and then requesting time off based on what it finds.

## Session-Level State

### Storage

Sessions are stored in an in-memory `Map<string, ChatMessage[]>` inside `session.service.ts`.

### Lifecycle

| Event | Behavior |
|---|---|
| First request with a new `sessionId` | A new entry is created in the map with an empty history array |
| Subsequent requests | The existing history is loaded, the new user message is appended, and the agent loop runs with the full context |
| Employee switch (dropdown) | The frontend generates a new `sessionId` and clears the message list, ensuring no cross-employee context leakage |
| Server restart | All sessions are lost (in-memory only) |

### What gets stored

Each element in the history array follows the OpenAI message format:

- **`system`** — the system prompt (prepended on every call, not stored per-session)
- **`user`** — the employee's natural-language message
- **`assistant`** — the model's response, which may include `tool_calls` (function name + JSON arguments)
- **`tool`** — the result of executing a tool call, linked back via `tool_call_id`

Storing the full message chain (including tool calls and results) allows the LLM to reference prior tool outputs in later turns, maintaining coherent multi-turn conversations.

## Tool Design and Selection

### Why these four tools?

The tools were chosen to cover the core employee self-service loop around time off:

| Tool | Purpose | Why it's needed |
|---|---|---|
| `getRemainingVacationDays` | Check vacation balance | The most common HR query — "how many days do I have left?" |
| `requestTimeOff` | Book time off | The primary action in the module; includes server-side validation (future dates, sufficient balance, business-day calculation) |
| `getCompanyPolicy` | Look up HR policies | Employees frequently need policy details before making decisions; avoids hallucinated policy answers |
| `getTeamCalendar` | View team members' planned absences | Enables informed scheduling — employees can check coverage *before* requesting time off, reducing conflicts |

### Schema design

Tools are defined using OpenAI's function-calling schema format:

```json
{
  "type": "function",
  "function": {
    "name": "getRemainingVacationDays",
    "description": "Get the remaining vacation day balance for an employee",
    "parameters": {
      "type": "object",
      "properties": {
        "employeeId": {
          "type": "string",
          "description": "The employee ID (e.g. EMP001)"
        }
      },
      "required": ["employeeId"]
    }
  }
}
```

Each schema provides clear parameter names, types, and descriptions so the model can reliably match user intent to the correct tool and extract the right arguments.

### The 4th tool rationale

`getTeamCalendar` exists because time-off planning is inherently a team activity. Without it, an employee would request days off blindly, potentially leaving the team short-staffed. With this tool, the agent can proactively suggest checking the calendar, or the employee can ask "is anyone on my team off next week?" before booking. It completes the self-service loop.

## Ambiguity Handling

### System prompt strategy

The system prompt explicitly instructs the agent to:

1. **Ask for clarification** rather than guess when information is missing.
2. **Respond in the user's language** (multilingual support).
3. **Never fabricate data** — always use tools to retrieve information.

### Examples

| User says | What's missing | Agent response |
|---|---|---|
| "I want time off" | Start and end dates | "Sure! What dates would you like to take off? Please provide a start and end date." |
| "What's the policy on X?" | Topic not recognized | "I can help with policies on: vacation, sick leave, remote work, holidays, and parental leave. Which one are you interested in?" |
| "Book me off tomorrow to yesterday" | Invalid date range | "The start date must be before the end date. Could you double-check the dates?" |

### Error handling

When a tool call fails (invalid employee ID, insufficient balance, past dates), the error is returned to the LLM as a tool result. The agent then translates the error into a helpful, human-readable message rather than surfacing raw error objects.

## Key Tradeoffs

### Cost vs. Latency

**GPT-4o-mini** sits at the sweet spot. A larger model (GPT-4o) would be marginally better at complex reasoning but 10-30x more expensive and slower — overkill for structured HR queries. A smaller/fine-tuned model could be cheaper but would lose the strong function-calling reliability and multilingual support that GPT-4o-mini provides out of the box.

### Simplicity vs. Robustness

An in-memory `Map` for sessions means zero infrastructure dependencies — no database to provision, no connection strings to manage. The cost is data loss on restart. For a demo/prototype this is the right call; the migration path to Redis or PostgreSQL is straightforward since the session service is isolated behind a clean interface.

### Rules vs. LLM Flexibility

The tool schemas act as **structured guardrails**: the LLM can only take actions that match a defined function signature with typed parameters. This prevents the model from inventing arbitrary side effects. Meanwhile, the LLM handles all the unstructured work — understanding intent, managing conversation flow, resolving ambiguity, and composing natural-language responses.

### Synchronous vs. Streaming

The current implementation waits for the full LLM response before sending it to the client. This simplifies the backend (no SSE/WebSocket plumbing) and the frontend (no incremental rendering logic). The tradeoff is perceived latency: users see nothing until the full response is ready. In production, streaming via Server-Sent Events would deliver tokens as they arrive, significantly improving the experience for longer responses.

## Limitations and Technical Risks

| Limitation | Impact | Mitigation path |
|---|---|---|
| **In-memory state** | Sessions lost on restart or deploy | Swap to Redis (sessions) + PostgreSQL (requests) |
| **No authentication** | Anyone can query any employee's data | Add OAuth/SSO; derive `employeeId` from token |
| **LLM hallucination** | Agent could fabricate vacation balances or policies | Strict tool schemas ensure data comes from tools, not the model's training data; system prompt reinforces this |
| **No rate limiting** | API and OpenAI costs vulnerable to abuse | Add express-rate-limit middleware + per-session token budgets |
| **Simplified business days** | Weekends excluded but not public holidays | Integrate a holiday calendar API per locale |
| **Single-process Node.js** | Could bottleneck under concurrent load | Run behind a load balancer with multiple instances; offload LLM calls to a queue if needed |
| **No approval workflow** | Time-off requests auto-approve | Add a `pending` state, manager notification, and approval/rejection endpoints |
