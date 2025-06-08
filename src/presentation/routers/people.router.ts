import { initServer } from '@ts-rest/fastify';
import { peopleContract } from 'birthday-bot-contracts';

import { DatabaseUserRepository } from '../../infrastructure/repositories/database-person.repository';
import { DatabaseCommunicationRepository } from '../../infrastructure/repositories/database-communication.repository';
import { PeopleService } from '../../application/services/people.service';

const s = initServer();

const databasePersonRepository = new DatabaseUserRepository();
const databaseCommunicationRepository = new DatabaseCommunicationRepository();

const peopleService = new PeopleService(
  databasePersonRepository,
  databaseCommunicationRepository
);

export const peopleRouter = s.router(peopleContract, {
  createPerson: async ({ body }) => {
    try {
      const person = await peopleService.createPerson(body);
      return {
        status: 200,
        body: person,
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
  updatePersonById: async ({ params, body }) => {
    try {
      const person = await peopleService.updatePersonById(params.id!, body);
      return {
        status: 200,
        body: person,
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
  getPersonById: async ({ params }) => {
    try {
      const person = await peopleService.getPersonById(params.id!);
      return {
        status: 200,
        body: person,
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
  getPaginatedPeople: async ({ query }) => {
    try {
      const { people, count } = await peopleService.getPaginatedPeople(query);
      return {
        status: 200,
        body: {
          people,
          count,
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
