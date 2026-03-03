export interface VacationBalance {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingRequests: number;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
  businessDays: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  totalVacationDays: number;
  usedVacationDays: number;
  pendingDays: number;
  timeOffRequests: TimeOffRequest[];
}

export interface TeamCalendarEntry {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending';
}

export interface PolicyInfo {
  topic: string;
  title: string;
  content: string;
}

export interface ChatRequest {
  sessionId: string;
  employeeId: string;
  message: string;
}

export interface ToolCallInfo {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface ChatResponse {
  response: string;
  toolCalls: ToolCallInfo[];
}
