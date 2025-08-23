import { initServer } from '@ts-rest/fastify';
import { contractMethodsContract } from 'birthday-bot-contracts';

import { DatabaseContactMethodRepository } from '../../infrastructure/repositories/database-contact-method.repository';
import { ContactMethodService } from '../../application/services/contact-method.service';

const s = initServer();

const databaseContactMethodRepository = new DatabaseContactMethodRepository();

const contactMethodService = new ContactMethodService(
  databaseContactMethodRepository,
);

export const contactMethodsRouter = s.router(contractMethodsContract, {
  getContactMethods: async () => {
    try {
      const contactMethods = await contactMethodService.getAllContactMethods();
      return {
        status: 200,
        body: {
          contactMethods: contactMethods.map((contactMethod) => ({
            id: contactMethod.id,
            application: contactMethod.application,
            metadata: contactMethod.metadata as Record<string, string | number | boolean>,
          })),
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
