import { z } from "zod";
import { getPaginatedCommunicationsQuerySchema } from "birthday-bot-contracts";

import { Communication } from "../../../domain/entities/communication";

export interface CommunicationUseCase {
  getPaginatedCommunications(query: z.infer<typeof getPaginatedCommunicationsQuerySchema>): Promise<{
    communications: Communication[];
    count: number;
  }>;
}