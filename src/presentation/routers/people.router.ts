import { initServer } from '@ts-rest/fastify';
import { peopleContract } from 'birthday-bot-contracts';

import { DatabaseUserRepository } from '../../infrastructure/repositories/database-person.repository';
import { DatabaseContactMethodRepository } from '../../infrastructure/repositories/database-contact-method.repository';
import { PeopleService } from '../../application/services/people.service';
import { ContactMethodService } from '../../application/services/contact-method.service';
import { Application } from '../../domain/value-objects/application';

const s = initServer();

const databasePersonRepository = new DatabaseUserRepository();
const databaseContactMethodRepository = new DatabaseContactMethodRepository();

const peopleService = new PeopleService(
  databasePersonRepository,
  databaseContactMethodRepository,
);

const contactMethodService = new ContactMethodService(
  databaseContactMethodRepository,
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
      await contactMethodService.upsertContactMethodByPersonId(params.id!, {
        id: 0,
        personId: params.id!,
        application: body.application as Application,
        metadata: body.metadata,
      });
      return {
        status: 200,
        body: person,
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
