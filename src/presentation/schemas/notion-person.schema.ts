import { z } from 'zod';

export const notionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  birthdate: z.string(),
});

export type NotionResponse = z.infer<typeof notionResponseSchema>;
