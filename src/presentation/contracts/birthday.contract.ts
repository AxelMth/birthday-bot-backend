import { initContract } from '@ts-rest/core';
import {
  sendTodayBirthdayMessagesBodySchema,
  sendTodayBirthdayMessagesResponseSchema,
  getNextBirthdaysUntilQuerySchema,
  getNextBirthdaysUntilResponseSchema,
} from '../schemas/birthday.schema';
import { errorBodySchema } from '../schemas/error.schema';

const c = initContract();

export const birthdayContract = c.router({
  sendTodayBirthdayMessages: {
    method: 'POST',
    path: '/api/birthday/send-messages',
    responses: {
      200: sendTodayBirthdayMessagesResponseSchema,
      500: errorBodySchema,
    },
    body: sendTodayBirthdayMessagesBodySchema,
    summary: 'Send today birthday messages',
  },
  getNextBirthdays: {
    method: 'GET',
    path: `/api/birthday/next`,
    query: getNextBirthdaysUntilQuerySchema,
    responses: {
      200: getNextBirthdaysUntilResponseSchema,
      500: errorBodySchema,
    },
    summary: 'Get next birthdays',
  },
});
