import { z } from 'zod';

// Define your schema using Zod
export const DailyMeetingReportSchema = z.object({
  meetingInfo: z.object({
    title: z.string(),
    date: z.string(),
    time: z.string(),
    duration: z.string(),
    location: z.string().optional(),
    meetingType: z.string().optional(),
    facilitator: z.string().optional(),
  }),
  attendees: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    department: z.string().optional(),
    email: z.string().optional(),
    status: z.enum(['present', 'absent', 'late']).optional(),
  })),
  agenda: z.array(z.object({
    item: z.string(),
    presenter: z.string().optional(),
    duration: z.string().optional(),
    status: z.enum(['completed', 'in-progress', 'postponed', 'cancelled']).optional(),
  })),
  keyDecisions: z.array(z.object({
    decision: z.string(),
    rationale: z.string().optional(),
    impact: z.string().optional(),
  })),
  actionItems: z.array(z.object({
    task: z.string(),
    assignee: z.string(),
    dueDate: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
    status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).optional(),
  })),
  nextSteps: z.array(z.object({
    step: z.string(),
    owner: z.string().optional(),
    timeline: z.string().optional(),
  })),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
  followUpMeeting: z.object({
    scheduled: z.boolean(),
    date: z.string().optional(),
    time: z.string().optional(),
    agenda: z.string().optional(),
  }).optional(),
});

// Export the type for TypeScript
export type DailyMeetingReportData = z.infer<typeof DailyMeetingReportSchema>;

export default DailyMeetingReportSchema;
