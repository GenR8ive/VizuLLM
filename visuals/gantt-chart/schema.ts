import { z } from 'zod';

// Define your schema using Zod for wx-react-gantt compatibility
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
    milestone: z.boolean().default(false),
    // Additional fields for wx-react-gantt
    type: z.enum(['task', 'milestone']).default('task'),
    level: z.number().min(0).default(0),
    parentId: z.string().optional(),
    expanded: z.boolean().default(true)
  })),
  showWeekends: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  // Print-specific options
  printOptions: z.object({
    orientation: z.enum(['landscape', 'portrait']).default('landscape'),
    showLegend: z.boolean().default(true),
    showTaskDetails: z.boolean().default(true),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    colorScheme: z.enum(['color', 'grayscale']).default('color')
  }).default({}),
  // Gantt chart display options
  displayOptions: z.object({
    showToday: z.boolean().default(true),
    showWeekNumbers: z.boolean().default(false),
    showTaskNames: z.boolean().default(true),
    showDependencies: z.boolean().default(true),
    rowHeight: z.number().min(20).max(100).default(40),
    columnWidth: z.number().min(20).max(100).default(30)
  }).default({})
});

// Export the type for TypeScript
export type GanttChartData = z.infer<typeof GanttChartSchema>;

export default GanttChartSchema;
