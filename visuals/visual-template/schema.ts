import { z } from 'zod';

// Define your schema using Zod
export const YourComponentSchema = z.object({

});

// Export the type for TypeScript
export type YourComponentData = z.infer<typeof YourComponentSchema>;

export default YourComponentSchema;
