import { z } from 'zod';

export const errorBodySchema = z.object({
  error: z.string(),
});
