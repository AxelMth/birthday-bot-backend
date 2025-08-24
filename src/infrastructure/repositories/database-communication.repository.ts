import { count } from "drizzle-orm";

import { db } from "../../db";
import { communications } from "../../db/schema";

import { CommunicationRepository } from "../../application/ports/output/communication.repository";
import { Communication } from "../../domain/entities/communication";
import { DatabaseCommunicationAdapter } from "../adapters/database-communication.adapter";

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

  async getPaginated(query: {
    pageSize: number;
    pageNumber: number;
  }): Promise<Communication[]> {
    const { pageSize, pageNumber } = query;
    const offset = (pageNumber - 1) * pageSize;
    const result = await db.select().from(communications).limit(pageSize).offset(offset);
    return result.map((res) => DatabaseCommunicationAdapter.toDomain(res));
  }

  async count(): Promise<number> {
    const result = await db.select({ count: count() }).from(communications);
    return result[0].count;
  }
}
