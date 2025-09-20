import { z } from 'zod';

// Parameter schema
export const ParameterDataSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  description: z.string().optional(),
  example: z.string().optional(),
  location: z.enum(['query', 'path', 'header', 'cookie']).optional(),
});

// Response schema
export const ResponseDataSchema = z.object({
  status: z.number(),
  description: z.string(),
  example: z.any().optional(),
});

// Request body schema
export const RequestBodyDataSchema = z.object({
  description: z.string().optional(),
  required: z.boolean().optional(),
  example: z.any().optional(),
});

// Authentication schema
export const AuthenticationDataSchema = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  scheme: z.string().optional(),
});

// Contact schema
export const ContactDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  url: z.string().optional(),
});

// License schema
export const LicenseDataSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
});

// Tag schema
export const TagDataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

// Endpoint schema
export const EndpointDataSchema = z.object({
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  summary: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  parameters: z.array(ParameterDataSchema).optional(),
  requestBody: RequestBodyDataSchema.optional(),
  responses: z.array(ResponseDataSchema).optional(),
  security: z.array(z.string()).optional(),
  deprecated: z.boolean().optional(),
});

// Main API Documentation schema
export const ApiDocumentationSchema = z.object({
  title: z.string(),
  version: z.string(),
  description: z.string().optional(),
  baseUrl: z.string().optional(),
  authentication: AuthenticationDataSchema.optional(),
  contact: ContactDataSchema.optional(),
  license: LicenseDataSchema.optional(),
  tags: z.array(TagDataSchema).optional(),
  endpoints: z.array(EndpointDataSchema),
});

// Export types
export type ParameterData = z.infer<typeof ParameterDataSchema>;
export type ResponseData = z.infer<typeof ResponseDataSchema>;
export type RequestBodyData = z.infer<typeof RequestBodyDataSchema>;
export type AuthenticationData = z.infer<typeof AuthenticationDataSchema>;
export type ContactData = z.infer<typeof ContactDataSchema>;
export type LicenseData = z.infer<typeof LicenseDataSchema>;
export type TagData = z.infer<typeof TagDataSchema>;
export type EndpointData = z.infer<typeof EndpointDataSchema>;
export type ApiDocumentationData = z.infer<typeof ApiDocumentationSchema>;

export default ApiDocumentationSchema;