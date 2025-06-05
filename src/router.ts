import { initServer } from '@ts-rest/express';

import { birthdayContract } from 'birthday-bot-contracts';

import { DatabaseUserRepository } from './infrastructure/repositories/database-user.repository';
import { DatabaseCommunicationRepository } from './infrastructure/repositories/database-communication.repository';
import { SlackBirthdayMessageRepository } from './infrastructure/repositories/slack-birthday-message.repository';
import { BirthdayService } from './application/services/birthday.service';

const databasePersonRepository = new DatabaseUserRepository();
const databaseCommunicationRepository = new DatabaseCommunicationRepository();

const messageRepositoriesByApplication = {
  slack: new SlackBirthdayMessageRepository(),
};

const birthdayService = new BirthdayService(
  messageRepositoriesByApplication,
  databasePersonRepository,
  databaseCommunicationRepository
);

const s = initServer();

export const birthdayRouter = s.router(birthdayContract, {
  sendTodayBirthdayMessages: async () => {
    try {
      const { birthdayMessageCount } =
        await birthdayService.sendTodayBirthdayMessages();
      return {
        status: 200,
        body: {
          message:
            birthdayMessageCount === 0
              ? 'No birthday today'
              : `${birthdayMessageCount} birthday message${birthdayMessageCount > 1 ? 's' : ''} sent successfully`,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          status: 500,
          body: {
            error: error.message,
          },
        };
      }
      return {
        status: 500,
        body: {
          error: 'An error occurred',
        },
      };
    }
  },
  getNextBirthdays: async ({ query }) => {
    try {
      const date = new Date(query.date as string);
      const people = await birthdayService.getNextBirthdaysUntil(date);
      return {
        status: 200,
        body: {
          people,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          status: 500,
          body: {
            error: error.message,
          },
        };
      }
      return {
        status: 500,
        body: {
          error: 'An error occurred',
        },
      };
    }
  },
});
