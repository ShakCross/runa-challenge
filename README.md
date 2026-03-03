# HR Assistant Agent — Time Off Module

A full-stack conversational HR assistant powered by an LLM agent. Employees can check their vacation balance, request time off, look up company policies, and view their team's calendar — all through natural language chat. The agent uses OpenAI's function-calling API to translate user intent into structured tool calls, handling multi-step workflows and ambiguous requests gracefully.

## Setup

### Prerequisites

- Node.js 18+
- npm
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone the repository

```bash
git clone <repo-url>
cd runa-challenge
```

### 2. Configure environment

Create a `.env` file inside `backend/`:

```bash
echo "OPENAI_API_KEY=sk-your-key-here" > backend/.env
```

Or export it directly:

```bash
export OPENAI_API_KEY=sk-your-key-here
```

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API server starts on **http://localhost:3001**.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI opens on **http://localhost:5173** and proxies `/api` requests to the backend.

## LLM Choice

**Model:** GPT-4o-mini via the OpenAI API (`openai` npm package)

| Criterion | Detail |
|---|---|
| **Tool calling** | Native `function` / `tool_calls` support — no prompt-hacking needed to dispatch structured actions |
| **Cost** | ~\$0.15 / 1M input tokens, ~\$0.60 / 1M output tokens — keeps demo and production costs low |
| **Latency** | Sub-second first-token times for typical HR queries |
| **Multilingual** | Strong out-of-the-box support; the agent responds in whatever language the user writes in |
| **Structured output** | Reliable JSON arguments for tool dispatch, reducing parsing errors |

## Assumptions

- **Employee identity:** The demo provides a dropdown to select an employee (EMP001–EMP005). Switching employees resets the conversation to prevent cross-employee context leakage. In production this would come from authentication/SSO.
- **Date handling:** All dates use `YYYY-MM-DD` format and are validated server-side. Business-day calculation excludes weekends but not public holidays (a holiday calendar would be needed in production).
- **Session management:** Conversation history lives in-memory and resets on server restart. Production would use Redis or a database.
- **Auto-approval:** Time-off requests are confirmed instantly. A real system would route through an approval workflow.
- **Mock data:** Five employees in an "Engineering" team with preset vacation balances (see table below).

| ID | Name | Total Days | Used |
|---|---|---|---|
| EMP001 | Alice Johnson | 20 | 5 |
| EMP002 | Bob Smith | 15 | 10 |
| EMP003 | Carol Williams | 20 | 2 |
| EMP004 | Dave Brown | 18 | 18 |
| EMP005 | Eve Davis | 22 | 8 |

## What I'd Improve With More Time

- **Authentication** — real employee identity via SSO/OAuth
- **Persistent storage** — PostgreSQL for employee & request data, Redis for sessions
- **Streaming responses** — token-by-token delivery for better perceived latency
- **Testing** — unit tests for each tool, integration tests for the agent loop, E2E tests for the chat UI
- **Rate limiting & input sanitization** — protect the API and the LLM from abuse
- **Holiday calendar** — accurate business-day calculation per locale
- **Approval workflow** — manager notifications, status tracking, cancellation
- **WebSocket transport** — real-time push for approval updates and team calendar changes

## One Thing I'd Add for Production

**Observability & Guardrails.** Every LLM call should emit structured logs capturing the prompt, tool calls, response, latency, and token usage. On top of that I'd add:

- **Cost tracking per session** so you can detect runaway loops or unexpectedly expensive conversations.
- **Content-safety filters** to catch hallucinated tool calls or inappropriate responses before they reach the user.
- **Alerting** on error rates, latency spikes, and unexpected tool-call patterns.

This matters because LLM-based agents can behave unpredictably — you need full visibility into *what* the agent did and *why*, plus automated guardrails to intervene when something goes wrong. A tool like LangSmith or a custom OpenTelemetry pipeline would handle the telemetry side.

## Project Structure

```
runa-challenge/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Express server entry point
│   │   ├── agent/
│   │   │   ├── agent.ts              # LLM orchestration loop
│   │   │   ├── tools.ts              # Tool definitions (OpenAI function schemas)
│   │   │   └── systemPrompt.ts       # System prompt for the HR agent
│   │   ├── services/
│   │   │   ├── employee.service.ts   # Mock employee data & business logic
│   │   │   └── session.service.ts    # In-memory conversation store
│   │   ├── routes/
│   │   │   └── chat.routes.ts        # POST /api/chat endpoint
│   │   └── types/
│   │       └── index.ts              # Shared TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ToolCallBadge.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── ARCHITECTURE.md
├── README.md
└── CLAUDE.md
```

## Available Tools

The agent has access to four tools exposed as OpenAI function-calling schemas:

| Tool | Parameters | Description |
|---|---|---|
| `getRemainingVacationDays` | `employeeId` | Returns vacation balance: total, used, remaining, and pending days |
| `requestTimeOff` | `employeeId`, `startDate`, `endDate` | Validates dates and balance, deducts business days, returns confirmation or error |
| `getCompanyPolicy` | `topic` | Returns policy text for: `vacation`, `sick_leave`, `remote_work`, `holidays`, `parental_leave` |
| `getTeamCalendar` | `employeeId`, `month?` | Lists approved time off for the employee's team — useful for checking coverage before booking |

## API

### `POST /api/chat`

**Request:**

```json
{
  "sessionId": "uuid-string",
  "employeeId": "EMP001",
  "message": "How many vacation days do I have left?"
}
```

**Response:**

```json
{
  "response": "You have 15 vacation days remaining out of 20 total.",
  "toolCalls": [
    {
      "tool": "getRemainingVacationDays",
      "args": { "employeeId": "EMP001" },
      "result": { "total": 20, "used": 5, "remaining": 15, "pending": 0 }
    }
  ]
}
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key |
| `PORT` | No | `3001` | Backend server port |
