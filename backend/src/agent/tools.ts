import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const toolDefinitions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getRemainingVacationDays',
      description:
        'Retrieves the vacation balance for an employee, including total days, used days, remaining days, and pending requests.',
      parameters: {
        type: 'object',
        properties: {
          employeeId: {
            type: 'string',
            description: 'The unique identifier of the employee (e.g. "EMP001").',
          },
        },
        required: ['employeeId'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'requestTimeOff',
      description:
        'Submits a time-off request for an employee. Validates that dates are in the future, startDate is before or equal to endDate, and the employee has sufficient vacation balance. Deducts business days from the balance upon approval.',
      parameters: {
        type: 'object',
        properties: {
          employeeId: {
            type: 'string',
            description: 'The unique identifier of the employee (e.g. "EMP001").',
          },
          startDate: {
            type: 'string',
            description: 'The first day of the requested time off in YYYY-MM-DD format.',
          },
          endDate: {
            type: 'string',
            description: 'The last day of the requested time off in YYYY-MM-DD format.',
          },
        },
        required: ['employeeId', 'startDate', 'endDate'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCompanyPolicy',
      description:
        'Retrieves company policy information for a given topic. If the topic is not recognized, returns a list of available topics.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            enum: ['vacation', 'sick_leave', 'remote_work', 'holidays', 'parental_leave'],
            description:
              'The policy topic to look up. Must be one of: vacation, sick_leave, remote_work, holidays, parental_leave.',
          },
        },
        required: ['topic'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTeamCalendar',
      description:
        "Retrieves the team calendar showing upcoming approved and pending time off for the employee's team members. Useful for checking team coverage before requesting time off.",
      parameters: {
        type: 'object',
        properties: {
          employeeId: {
            type: 'string',
            description: 'The unique identifier of the employee whose team calendar to retrieve.',
          },
          month: {
            type: 'string',
            description:
              'Optional month to filter by, in YYYY-MM format. If omitted, returns upcoming entries.',
          },
        },
        required: ['employeeId'],
        additionalProperties: false,
      },
    },
  },
];
