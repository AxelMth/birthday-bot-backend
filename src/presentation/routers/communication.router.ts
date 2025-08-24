import { initServer } from "@ts-rest/fastify";

import { communicationContract } from "birthday-bot-contracts";
import { CommunicationService } from "../../application/services/communication.service";
import { DatabaseCommunicationRepository } from "../../infrastructure/repositories/database-communication.repository";

const s = initServer();

const communicationService = new CommunicationService(new DatabaseCommunicationRepository());

export const communicationRouter = s.router(communicationContract, {
  getPaginatedCommunications: async ({ query }) => {
    const { communications, count } = await communicationService.getPaginatedCommunications(query);
    return {
      status: 200,
      body: {
        communications,
        count,
      },
    };
  },
});
