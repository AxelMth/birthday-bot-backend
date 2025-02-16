import { PersonRepository } from '@/application/ports/output/person.repository';
import { db } from '../../db';
import { usersTable } from '../../db/schema';
import { Person } from '../../domain/entities/person';
import { DatabaseUserAdapter } from '../adapters/database-user.adapter';

export class DatabasePersonRepository implements PersonRepository {
  async getPeople(): Promise<Person[]> {
    const users = await db.select().from(usersTable).execute();
    return users.map(DatabaseUserAdapter.toDomain);
  }
}
