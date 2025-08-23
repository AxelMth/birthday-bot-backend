import { initServer } from '@ts-rest/fastify';
import { peopleContract } from 'birthday-bot-contracts';

import { DatabasePersonRepository } from '../../infrastructure/repositories/database-person.repository';
import { DatabaseContactMethodRepository } from '../../infrastructure/repositories/database-contact-method.repository';
import { PeopleService } from '../../application/services/people.service';
import { ContactMethodService } from '../../application/services/contact-method.service';
import { DatabasePersonContactMethodRepository } from '../../infrastructure/repositories/database-person-contact-method.repository';
import { PeopleContactMethodService } from '../../application/services/people-contact-method.service';

const s = initServer();

const databasePersonRepository = new DatabasePersonRepository();
const contactMethodRepository = new DatabaseContactMethodRepository();
const personContactMethodRepository = new DatabasePersonContactMethodRepository();

const peopleService = new PeopleService(
  databasePersonRepository,
  personContactMethodRepository,
);

const contactMethodService = new ContactMethodService(
  contactMethodRepository,
);

const peopleContactMethodService = new PeopleContactMethodService(
  databasePersonRepository,
  personContactMethodRepository
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
      await peopleContactMethodService.upsertPersonContactMethod(params.id!, person.contactMethod!, person.contactMethodMetadata! as any); // TODO: fix this
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
          people: people.map(person => ({
            id: person.id,
            name: person.name,
            birthdate: person.birthdate,
            contactMethod: person.contactMethod ? {
              id: person.contactMethod.id,
              applicationName: person.contactMethod.applicationName,
            } : null,
            contactMethodMetadata: person.contactMethodMetadata || null,
          })),
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
