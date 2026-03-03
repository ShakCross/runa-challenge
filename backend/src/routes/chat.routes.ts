import { Router } from 'express';
import type { Request, Response } from 'express';
import { processMessage } from '../agent/agent.js';
import type { ChatRequest, ChatResponse } from '../types/index.js';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  const { sessionId, employeeId, message } = req.body as Partial<ChatRequest>;

  if (!sessionId || !employeeId || !message) {
    res.status(400).json({
      error: 'Missing required fields: sessionId, employeeId, and message are all required.',
    });
    return;
  }

  try {
    const result = await processMessage(sessionId, employeeId, message);

    const response: ChatResponse = {
      response: result.response,
      toolCalls: result.toolCalls,
    };

    res.json(response);
  } catch (err) {
    console.error('Error processing chat message:', err);
    res.status(500).json({
      error: 'An internal error occurred while processing your message.',
    });
  }
});

export default router;
