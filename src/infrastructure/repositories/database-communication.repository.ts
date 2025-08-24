import { db } from "../../db";
import { communications } from "../../db/schema";

import { CommunicationRepository } from "../../application/ports/output/communication.repository";
import { Communication } from "../../domain/entities/communication";

export class DatabaseCommunicationRepository implements CommunicationRepository {
  async create(communication: Omit<Communication, 'id' | 'createdAt'>): Promise<Communication> {
    const [result] = await db
      .insert(communications)
      .values({
        personId: communication.personId,
        contactMethodId: communication.contactMethodId,
        message: communication.message,
      })
      .returning();

    return {
      id: result.id,
      personId: result.personId,
      contactMethodId: result.contactMethodId,
      message: result.message,
      sentAt: result.sentAt || undefined,
    };
  }
}
