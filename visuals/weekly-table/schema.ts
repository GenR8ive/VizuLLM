import { z } from 'zod';

// Define your schema using Zod
export const WeeklyTableSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  theme: z.enum(['default', 'gradient', 'minimal', 'colorful']).optional().default('default'),
  rows: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string().optional(), // emoji or icon name
    color: z.string().optional(), // hex color or preset
    time: z.string().optional(), // time range like "9:00 AM - 10:00 AM"
    category: z.string().optional()
  })),
  items: z.record(
    z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    z.record(z.string(), z.object({
      content: z.string(),
      notes: z.string().optional()
    }).optional())
  ).optional()
});

// Export the type for TypeScript
export type WeeklyTableData = z.infer<typeof WeeklyTableSchema>;

export default WeeklyTableSchema;
