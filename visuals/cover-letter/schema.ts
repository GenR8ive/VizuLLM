import { z } from 'zod';

// Define your schema using Zod
export const CoverLetterSchema = z.object({
  // Personal Information
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required").optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
  
  // Date
  date: z.string().min(1, "Date is required"),
  
  // Company Information
  companyName: z.string().min(1, "Company name is required"),
  
  // Job Information
  jobTitle: z.string().min(1, "Job title is required"),
  
  // Cover Letter Content (combined)
  content: z.string().min(1, "Content is required")
});

// Export the type for TypeScript
export type CoverLetterData = z.infer<typeof CoverLetterSchema>;

export default CoverLetterSchema;
