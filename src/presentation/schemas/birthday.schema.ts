import { z } from 'zod';

export const sendTodayBirthdayMessagesBodySchema = z.object({});

export const sendTodayBirthdayMessagesResponseSchema = z.object({
  message: z.string(),
});

export const getNextBirthdaysUntilQuerySchema = z.object({
  date: z.string().date(),
});

export const getNextBirthdaysUntilResponseSchema = z.object({
  people: z.array(
    z.object({
      name: z.string(),
      birthdate: z.date(),
    })
  ),
});
