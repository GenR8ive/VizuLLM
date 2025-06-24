import { z } from 'zod';

// Define your schema using Zod
export const GanttChartSchema = z.object({
  title: z.string().default('Project Timeline'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tasks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    progress: z.number().min(0).max(100).default(0),
    assignee: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    color: z.string().optional(),
    milestone: z.boolean().default(false)
  })),
  showWeekends: z.boolean().default(true),
  showProgress: z.boolean().default(true)
});

// Export the type for TypeScript
export type GanttChartData = z.infer<typeof GanttChartSchema>;

export default GanttChartSchema;
