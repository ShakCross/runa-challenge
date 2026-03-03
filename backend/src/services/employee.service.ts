import { v4 as uuidv4 } from 'uuid';
import type {
  Employee,
  VacationBalance,
  TimeOffRequest,
  TeamCalendarEntry,
  PolicyInfo,
} from '../types/index.js';

const employees: Map<string, Employee> = new Map([
  [
    'EMP001',
    {
      id: 'EMP001',
      name: 'Alice Johnson',
      department: 'Engineering',
      totalVacationDays: 20,
      usedVacationDays: 5,
      pendingDays: 0,
      timeOffRequests: [],
    },
  ],
  [
    'EMP002',
    {
      id: 'EMP002',
      name: 'Bob Smith',
      department: 'Engineering',
      totalVacationDays: 15,
      usedVacationDays: 10,
      pendingDays: 0,
      timeOffRequests: [],
    },
  ],
  [
    'EMP003',
    {
      id: 'EMP003',
      name: 'Carol Williams',
      department: 'Engineering',
      totalVacationDays: 20,
      usedVacationDays: 2,
      pendingDays: 0,
      timeOffRequests: [],
    },
  ],
  [
    'EMP004',
    {
      id: 'EMP004',
      name: 'Dave Brown',
      department: 'Engineering',
      totalVacationDays: 18,
      usedVacationDays: 18,
      pendingDays: 0,
      timeOffRequests: [],
    },
  ],
  [
    'EMP005',
    {
      id: 'EMP005',
      name: 'Eve Davis',
      department: 'Engineering',
      totalVacationDays: 22,
      usedVacationDays: 8,
      pendingDays: 0,
      timeOffRequests: [],
    },
  ],
]);

const policies: Map<string, PolicyInfo> = new Map([
  [
    'vacation',
    {
      topic: 'vacation',
      title: 'Vacation Policy',
      content:
        'Employees receive between 15–22 vacation days per year based on seniority. Vacation must be requested at least 2 weeks in advance. Requests are subject to team coverage requirements. Unused days can be carried over up to 5 days into the next year. Vacation days reset on January 1st.',
    },
  ],
  [
    'sick_leave',
    {
      topic: 'sick_leave',
      title: 'Sick Leave Policy',
      content:
        'Employees are entitled to up to 10 paid sick days per year. A medical certificate is required for absences longer than 3 consecutive days. Sick leave does not carry over. Notify your manager as early as possible on the day of absence.',
    },
  ],
  [
    'remote_work',
    {
      topic: 'remote_work',
      title: 'Remote Work Policy',
      content:
        'Employees may work remotely up to 3 days per week with manager approval. Fully remote arrangements require VP-level approval. Core collaboration hours are 10:00 AM – 3:00 PM in the employee\'s local timezone. Equipment stipend of $500/year is available for home office setup.',
    },
  ],
  [
    'holidays',
    {
      topic: 'holidays',
      title: 'Company Holidays',
      content:
        "The company observes the following paid holidays: New Year's Day (Jan 1), President's Day (3rd Mon Feb), Memorial Day (last Mon May), Independence Day (Jul 4), Labor Day (1st Mon Sep), Thanksgiving (4th Thu Nov), Day after Thanksgiving (4th Fri Nov), Christmas Eve (Dec 24), Christmas Day (Dec 25), New Year's Eve (Dec 31). If a holiday falls on a weekend, it is observed on the nearest weekday.",
    },
  ],
  [
    'parental_leave',
    {
      topic: 'parental_leave',
      title: 'Parental Leave Policy',
      content:
        'Primary caregivers receive 16 weeks of paid parental leave. Secondary caregivers receive 6 weeks of paid parental leave. Leave must begin within 12 months of the birth or adoption. Leave can be taken continuously or split into two blocks with manager approval.',
    },
  ],
]);

function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function getRemainingVacationDays(employeeId: string): VacationBalance | { error: string } {
  const employee = employees.get(employeeId);
  if (!employee) {
    return { error: `Employee with ID "${employeeId}" not found.` };
  }

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    totalDays: employee.totalVacationDays,
    usedDays: employee.usedVacationDays,
    remainingDays: employee.totalVacationDays - employee.usedVacationDays - employee.pendingDays,
    pendingRequests: employee.pendingDays,
  };
}

export function requestTimeOff(
  employeeId: string,
  startDate: string,
  endDate: string,
): TimeOffRequest | { error: string } {
  const employee = employees.get(employeeId);
  if (!employee) {
    return { error: `Employee with ID "${employeeId}" not found.` };
  }

  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: 'Invalid date format. Please use YYYY-MM-DD.' };
  }

  if (start < today) {
    return { error: 'Start date must be in the future.' };
  }

  if (start > end) {
    return { error: 'Start date must be on or before the end date.' };
  }

  const businessDays = countBusinessDays(start, end);
  if (businessDays === 0) {
    return { error: 'The selected dates contain no business days (only weekends).' };
  }

  const remaining = employee.totalVacationDays - employee.usedVacationDays - employee.pendingDays;
  if (businessDays > remaining) {
    return {
      error: `Insufficient balance. You need ${businessDays} business day(s) but only have ${remaining} remaining.`,
    };
  }

  const request: TimeOffRequest = {
    id: uuidv4(),
    employeeId: employee.id,
    startDate,
    endDate,
    status: 'approved',
    businessDays,
    createdAt: new Date().toISOString(),
  };

  employee.usedVacationDays += businessDays;
  employee.timeOffRequests.push(request);

  return request;
}

export function getCompanyPolicy(topic: string): PolicyInfo | { error: string } {
  const policy = policies.get(topic);
  if (!policy) {
    const available = Array.from(policies.keys()).join(', ');
    return { error: `Unknown topic "${topic}". Available topics: ${available}.` };
  }
  return policy;
}

export function getTeamCalendar(
  employeeId: string,
  month?: string,
): TeamCalendarEntry[] | { error: string } {
  const employee = employees.get(employeeId);
  if (!employee) {
    return { error: `Employee with ID "${employeeId}" not found.` };
  }

  const teamMembers = Array.from(employees.values()).filter(
    (e) => e.department === employee.department,
  );

  const entries: TeamCalendarEntry[] = [];

  for (const member of teamMembers) {
    for (const request of member.timeOffRequests) {
      if (request.status === 'rejected') continue;

      if (month) {
        const requestMonth = request.startDate.substring(0, 7);
        const requestEndMonth = request.endDate.substring(0, 7);
        if (requestMonth !== month && requestEndMonth !== month) continue;
      }

      entries.push({
        employeeId: member.id,
        employeeName: member.name,
        startDate: request.startDate,
        endDate: request.endDate,
        status: request.status === 'approved' ? 'approved' : 'pending',
      });
    }
  }

  entries.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return entries;
}
