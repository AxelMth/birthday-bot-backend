import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { contactMethods } from '../../db/schema';
import { DatabaseCommunicationAdapter } from '../adapters/database-communication.adapter';
import { CommunicationRepository } from '../../application/ports/output/communication.repository';
import { Communication } from '../../domain/entities/communication';

export class DatabaseCommunicationRepository
  implements CommunicationRepository
{
  async getByPersonId(personId: number): Promise<Communication[]> {
    const _communications = await db
      .select()
      .from(contactMethods)
      .where(eq(contactMethods.personId, personId));
    return _communications.map(DatabaseCommunicationAdapter.toDomain);
  }

  async createCommunication(
    communication: Communication
  ): Promise<Communication> {
    const [id] = await db
      .insert(contactMethods)
      .values(DatabaseCommunicationAdapter.toDatabase(communication));
    return { ...communication, id };
  }

  async updateCommunicationById(
    id: number,
    communication: Communication
  ): Promise<void> {
    await db
      .update(contactMethods)
      .set(DatabaseCommunicationAdapter.toDatabase(communication))
      .where(eq(contactMethods.id, id));
  }
}
