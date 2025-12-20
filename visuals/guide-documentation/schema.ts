import { z } from 'zod';

// Code block schema
export const CodeBlockSchema = z.object({
  language: z.string().optional(),
  code: z.string(),
  filename: z.string().optional(),
});

// List item schema
export const ListItemSchema = z.object({
  text: z.string(),
  subItems: z.array(z.string()).optional(),
});

// List schema
export const ListSchema = z.object({
  type: z.enum(['ordered', 'unordered']),
  items: z.array(z.union([z.string(), ListItemSchema])),
});

// Callout/Alert schema (for tips, warnings, notes, etc.)
export const CalloutSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success', 'tip', 'note']),
  title: z.string().optional(),
  content: z.string(),
});

// Step schema for step-by-step instructions
export const StepSchema = z.object({
  number: z.number().optional(),
  title: z.string().optional(),
  description: z.string(),
  code: CodeBlockSchema.optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
});

// Content block schema (flexible content within sections)
export const ContentBlockSchema = z.object({
  type: z.enum(['paragraph', 'code', 'list', 'callout', 'image', 'heading', 'steps']),
  content: z.any(), // Content varies by type
});

// Subsection schema
export const SubsectionSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  content: z.array(ContentBlockSchema).optional(),
  subsections: z.array(z.lazy(() => SubsectionSchema)).optional(),
});

// Section schema
export const SectionSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  content: z.array(ContentBlockSchema).optional(),
  subsections: z.array(SubsectionSchema).optional(),
});

// Prerequisite schema
export const PrerequisiteSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  items: z.array(z.string()).optional(),
});

// Related resource schema
export const RelatedResourceSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['article', 'video', 'documentation', 'tutorial', 'tool', 'other']).optional(),
});

// Main Guide Documentation schema
export const GuideDocumentationSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  version: z.string().optional(),
  lastUpdated: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(PrerequisiteSchema).optional(),
  estimatedTime: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  sections: z.array(SectionSchema),
  relatedResources: z.array(RelatedResourceSchema).optional(),
  footer: z.string().optional(),
});

// Export types
export type CodeBlockData = z.infer<typeof CodeBlockSchema>;
export type ListItemData = z.infer<typeof ListItemSchema>;
export type ListData = z.infer<typeof ListSchema>;
export type CalloutData = z.infer<typeof CalloutSchema>;
export type StepData = z.infer<typeof StepSchema>;
export type ContentBlockData = z.infer<typeof ContentBlockSchema>;
export type SubsectionData = z.infer<typeof SubsectionSchema>;
export type SectionData = z.infer<typeof SectionSchema>;
export type PrerequisiteData = z.infer<typeof PrerequisiteSchema>;
export type RelatedResourceData = z.infer<typeof RelatedResourceSchema>;
export type GuideDocumentationData = z.infer<typeof GuideDocumentationSchema>;

export default GuideDocumentationSchema;






