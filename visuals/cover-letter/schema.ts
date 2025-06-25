import { z } from 'zod';

// Define your schema using Zod
export const CoverLetterSchema = z.object({
  // Personal Information
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  
  // Date
  date: z.string().min(1, "Date is required"),
  
  // Company Information
  companyName: z.string().min(1, "Company name is required"),
  hiringManager: z.string().min(1, "Hiring manager name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  
  // Job Information
  jobTitle: z.string().min(1, "Job title is required"),
  
  // Cover Letter Content
  greeting: z.string().min(1, "Greeting is required"),
  opening: z.string().min(1, "Opening paragraph is required"),
  body: z.string().min(1, "Body content is required"),
  closing: z.string().min(1, "Closing paragraph is required"),
  signature: z.string().min(1, "Signature is required")
});

// Export the type for TypeScript
export type CoverLetterData = z.infer<typeof CoverLetterSchema>;

export default CoverLetterSchema;
