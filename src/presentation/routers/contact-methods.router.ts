import { initServer } from "@ts-rest/fastify";
import { contractMethodsContract } from "birthday-bot-contracts";

import { DatabaseContactMethodRepository } from "../../infrastructure/repositories/database-contact-method.repository";
import { ContactMethodService } from "../../application/services/contact-method.service";

const s = initServer();

const databaseContactMethodRepository = new DatabaseContactMethodRepository();

const contactMethodService = new ContactMethodService(
  databaseContactMethodRepository,
);

export const contactMethodsRouter = s.router(contractMethodsContract, {
  getContactMethods: async () => {
    const contactMethods = await contactMethodService.getAllContactMethods();
    return {
      status: 200,
      body: {
        contactMethods: contactMethods.map((contactMethod) => ({
          id: contactMethod.id,
          applicationName: contactMethod.applicationName,
          applicationMetadata: contactMethod.applicationMetadata as any, // TODO: fix this
        })),
      },
    };
  },
});
