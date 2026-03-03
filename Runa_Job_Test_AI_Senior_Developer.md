# AI Agents Take-Home Challenge

## Objective

Build a minimal but well-structured **HR Assistant Agent** that can
answer requests on the **Time Off Module**.

Prioritize the agent layer over UI polish. Allow us to understand your
thinking on AI system design and agent architecture.

**Time estimate:** 3--4 hours.

------------------------------------------------------------------------

## Scenario

You are building an HR Assistant Agent that helps employees with:

-   Checking remaining vacation days\
-   Requesting time off\
-   Asking about company policies

The assistant should:

-   Understand user intent\
-   Maintain conversation history within a session\
-   Return structured and contextual answers\
-   Handle ambiguous or incomplete user input gracefully --- the agent
    should ask for clarification rather than fail silently\
-   Call the appropriate "tool"\
-   Respond in the same language the user writes in

------------------------------------------------------------------------

## Required Tools

1.  `getRemainingVacationDays(employeeId)`
    -   Returns mock data
2.  `requestTimeOff(employeeId, startDate, endDate)`
    -   Validates dates are in the future\
    -   Checks sufficient balance\
    -   Deducts days\
    -   Returns confirmation
3.  `getCompanyPolicy(topic)`
    -   Returns mock policy text
4.  **One additional tool of your choice**
    -   This is intentional. Pick something that makes sense in this
        context and explain why you chose it.

------------------------------------------------------------------------

## Technical Requirements

### Backend

-   Uses an LLM of your choice (justify your choice in the README)

### Frontend (React)

-   Minimal chat UI:
    -   Message list\
    -   Text input\
    -   Loading state\
-   No styling requirements --- we're not evaluating CSS\
-   If you have strong frontend skills, allow us to see what you are
    capable of\
-   Keep the UI simple, but demonstrate your knowledge

------------------------------------------------------------------------

## Deliverables

-   GitHub repository\
-   README

### README must include:

-   Setup instructions\
-   Which LLM you used and why\
-   Assumptions you made (especially around user identity and date
    handling)\
-   What you'd improve with more time\
-   One thing you'd add if this were going to production

------------------------------------------------------------------------

## Architectural Design (1--2 pages)

Include a brief but clear explanation of the agent architecture and its
technical decisions.

At a minimum, it must cover:

-   End-to-end flow (user input → reasoning/orchestration → tool calls →
    response)\
-   Session-level state and conversation history management\
-   Tool design and selection criteria for each tool\
-   Ambiguity handling and clarification strategy\
-   Key tradeoffs (for example: cost vs latency, simplicity vs
    robustness, rules vs LLM flexibility)\
-   Current limitations and technical risks
