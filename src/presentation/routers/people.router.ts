import { initServer } from '@ts-rest/fastify';
import { peopleContract } from 'birthday-bot-contracts';

import { DatabasePersonRepository } from '../../infrastructure/repositories/database-person.repository';
import { PeopleService } from '../../application/services/people.service';
import { Application } from '../../domain/value-objects/application';

const s = initServer();

const databasePersonRepository = new DatabasePersonRepository();
const peopleService = new PeopleService(databasePersonRepository);

// Helper function to convert domain to DTO
function toPersonDTO(person: any) {
  let application: string | undefined;
  let applicationMetadata: Record<string, string> | undefined;

  if (person.preferredContact) {
    switch (person.preferredContact.kind) {
      case Application.Slack:
        application = Application.Slack;
        applicationMetadata = {
          channelId: person.preferredContact.info.channelId,
          userId: person.preferredContact.info.userId,
        };
        break;
    }
  }

  return {
    id: person.id,
    name: person.name,
    birthDate: person.birthDate?.toISOString().split('T')[0],
    application,
    applicationMetadata,
  };
}

export const peopleRouter = s.router(peopleContract, {
  createPerson: async ({ body }) => {
    try {
      const person = await peopleService.createPerson(body);
      return {
        status: 200,
        body: toPersonDTO(person),
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
        body: toPersonDTO(person),
      };
    } catch (error) {
      console.error(error);
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
        body: toPersonDTO(person),
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
          people: people.map(toPersonDTO),
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
  deletePersonById: async ({ params }) => {
    try {
      await peopleService.deletePersonById(params.id!);
      return {
        status: 200,
        body: {
          success: true,
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
