import { z } from 'zod';

// Define your schema using Zod
export const WeeklyMonthlyAgendaSchema = z.object({
  title: z.string().optional().default('My Agenda'),
  timePeriod: z.enum(['weekly', 'monthly']).default('weekly'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    time: z.string().optional(),
    duration: z.number().optional(), // in minutes
    category: z.enum(['meeting', 'task', 'reminder', 'break', 'personal']).default('task'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    completed: z.boolean().default(false),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
  })).default([]),
  categories: z.array(z.object({
    name: z.string(),
    color: z.string(),
    icon: z.string().optional(),
  })).default([
    { name: 'meeting', color: '#3B82F6', icon: '👥' },
    { name: 'task', color: '#10B981', icon: '✅' },
    { name: 'reminder', color: '#F59E0B', icon: '⏰' },
    { name: 'break', color: '#8B5CF6', icon: '☕' },
    { name: 'personal', color: '#EC4899', icon: '💝' },
  ]),
});

// Export the type for TypeScript
export type WeeklyMonthlyAgendaData = z.infer<typeof WeeklyMonthlyAgendaSchema>;

export default WeeklyMonthlyAgendaSchema;
