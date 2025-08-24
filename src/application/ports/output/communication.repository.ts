import { z } from "zod";
import { getPaginatedCommunicationsQuerySchema } from "birthday-bot-contracts";

import { Communication } from "../../../domain/entities/communication";

export interface CommunicationRepository {
  create(communication: Omit<Communication, 'id'>): Promise<Communication>;
  getPaginated(query: z.infer<typeof getPaginatedCommunicationsQuerySchema>): Promise<Communication[]>;
  count(): Promise<number>;
}