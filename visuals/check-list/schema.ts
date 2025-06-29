import { z } from 'zod';

// Define your schema using Zod
export const CheckListSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  theme: z.object({
    primaryColor: z.enum(['blue', 'green', 'purple', 'pink', 'orange', 'red']).default('blue'),
    style: z.enum(['modern', 'funny', 'professional', 'minimal']).default('modern'),
    showEmojis: z.boolean().default(true),
  }).optional(),
  header: z.object({
    showDate: z.boolean().default(true),
    showTime: z.boolean().default(false),
    showAuthor: z.boolean().default(false),
    author: z.string().optional(),
    customHeader: z.string().optional(),
  }).optional(),
  items: z.array(z.object({
    text: z.string().min(1, "Item text is required"),
    emoji: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    isCompleted: z.boolean().default(false),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
  })).min(1, "At least one item is required"),
  footer: z.object({
    customFooter: z.string().optional(),
  }).optional(),
  printSettings: z.object({
    showPageNumbers: z.boolean().default(true),
    showPrintDate: z.boolean().default(true),
    compactMode: z.boolean().default(false),
  }).optional(),
});

// Export the type for TypeScript
export type CheckListData = z.infer<typeof CheckListSchema>;

export default CheckListSchema;
