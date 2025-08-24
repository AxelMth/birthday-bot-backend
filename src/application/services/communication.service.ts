import { z } from "zod";
import { getPaginatedCommunicationsQuerySchema } from "birthday-bot-contracts";

import { CommunicationRepository } from "../ports/output/communication.repository";
import { CommunicationUseCase } from "../ports/input/communication.use-case";

export class CommunicationService implements CommunicationUseCase {
  constructor(private readonly communicationRepository: CommunicationRepository) {}

  async getPaginatedCommunications(query: z.infer<typeof getPaginatedCommunicationsQuerySchema>) {
    const communications = await this.communicationRepository.getPaginated(query);
    const count = await this.communicationRepository.count();
    return {
      communications,
      count,
    };
  }
}