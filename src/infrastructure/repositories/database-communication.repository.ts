import { CommunicationRepository } from '@/application/ports/output/communication.repository';
import { db } from '../../db';
import { communications, } from '../../db/schema';
import { eq, } from 'drizzle-orm';
import { DatabaseCommunicationAdapter } from '../adapters/database-communication.adapter';
import { Communication } from '@/domain/entities/communication';

export class DatabaseCommunicationRepository implements CommunicationRepository {
  async getByPersonId(personId: number): Promise<Communication[]> {
    const _communications = await db
      .select()
      .from(communications)
      .where(eq(communications.userId, personId))
      .execute();
    return _communications.map(DatabaseCommunicationAdapter.toDomain);
  }
}
