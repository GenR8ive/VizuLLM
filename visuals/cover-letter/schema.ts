import { z } from 'zod';

// Define your schema using Zod
export const CoverLetterSchema = z.object({
  // Personal Information
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),

  // Date
  date: z.string().min(1),

  // Company Information
  companyName: z.string().min(1),

  // Job Information
  jobTitle: z.string().min(1),

  // Cover Letter Content (combined)
  content: z.string().min(1)
});

// Export the type for TypeScript
export type CoverLetterData = z.infer<typeof CoverLetterSchema>;

export default CoverLetterSchema;
