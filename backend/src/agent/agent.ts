import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';
import { toolDefinitions } from './tools.js';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import { sessionService } from '../services/session.service.js';
import * as employeeService from '../services/employee.service.js';
import type { ToolCallInfo } from '../types/index.js';

const openai = new OpenAI();

const MAX_ITERATIONS = 10;

function executeTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case 'getRemainingVacationDays':
      return employeeService.getRemainingVacationDays(args.employeeId as string);

    case 'requestTimeOff':
      return employeeService.requestTimeOff(
        args.employeeId as string,
        args.startDate as string,
        args.endDate as string,
      );

    case 'getCompanyPolicy':
      return employeeService.getCompanyPolicy(args.topic as string);

    case 'getTeamCalendar':
      return employeeService.getTeamCalendar(
        args.employeeId as string,
        args.month as string | undefined,
      );

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function buildSystemMessage(employeeId: string): ChatCompletionMessageParam {
  return {
    role: 'system',
    content: `${SYSTEM_PROMPT}\n\n## Current Session Context\n\nThe employee you are assisting has ID: **${employeeId}**. Use this ID automatically when calling tools on their behalf.`,
  };
}

export async function processMessage(
  sessionId: string,
  employeeId: string,
  userMessage: string,
): Promise<{ response: string; toolCalls: ToolCallInfo[] }> {
  sessionService.addMessage(sessionId, { role: 'user', content: userMessage });

  const history = sessionService.getHistory(sessionId);
  const messages: ChatCompletionMessageParam[] = [buildSystemMessage(employeeId), ...history];

  const collectedToolCalls: ToolCallInfo[] = [];

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: toolDefinitions,
    });

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error('No response from OpenAI');
    }

    const assistantMessage = choice.message;

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      const responseText = assistantMessage.content ?? '';

      sessionService.addMessage(sessionId, { role: 'assistant', content: responseText });

      return { response: responseText, toolCalls: collectedToolCalls };
    }

    const assistantRecord: ChatCompletionMessageParam = {
      role: 'assistant',
      content: assistantMessage.content ?? null,
      tool_calls: assistantMessage.tool_calls,
    };
    messages.push(assistantRecord);
    sessionService.addMessage(sessionId, assistantRecord);

    const toolMessages: ChatCompletionMessageParam[] = [];

    for (const toolCall of assistantMessage.tool_calls as ChatCompletionMessageToolCall[]) {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      } catch {
        args = {};
      }

      let result: unknown;
      try {
        result = executeTool(toolCall.function.name, args);
      } catch (err) {
        result = { error: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}` };
      }

      collectedToolCalls.push({
        tool: toolCall.function.name,
        args,
        result,
      });

      const toolMessage: ChatCompletionMessageParam = {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      };
      toolMessages.push(toolMessage);
    }

    messages.push(...toolMessages);
    sessionService.addMessages(sessionId, toolMessages);
  }

  const fallback = 'I apologize, but I was unable to complete your request. Please try again.';
  sessionService.addMessage(sessionId, { role: 'assistant', content: fallback });
  return { response: fallback, toolCalls: collectedToolCalls };
}
