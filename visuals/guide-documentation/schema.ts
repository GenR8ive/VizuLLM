import { z } from 'zod';

const ContentBlockSchema = z.object({
  type: z.enum(['paragraph', 'code', 'list', 'callout', 'image', 'heading', 'steps']),
  content: z.any(),
});

const SectionSchema = z.object({
  title: z.string(),
  content: z.array(ContentBlockSchema).optional(),
}).passthrough();

export const GuideDocumentationSchema = z.object({
  title: z.string(),
  sections: z.array(SectionSchema),
}).passthrough();

export type GuideDocumentationData = z.infer<typeof GuideDocumentationSchema>;
export type SectionData = z.infer<typeof SectionSchema>;
export type SubsectionData = { id?: string; title: string; content?: ContentBlockData[]; subsections?: SubsectionData[] };
export type ContentBlockData = z.infer<typeof ContentBlockSchema>;

export default GuideDocumentationSchema;
