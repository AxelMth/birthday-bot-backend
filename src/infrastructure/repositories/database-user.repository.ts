import { PersonRepository } from '@/application/ports/output/person.repository';
import { db } from '../../db';
import { usersTable } from '../../db/schema';
import { Person } from '../../domain/entities/person';
import { DatabaseUserAdapter } from '../adapters/database-user.adapter';
import { like } from 'drizzle-orm';

export class DatabaseUserRepository implements PersonRepository {
  async getPeople(): Promise<Person[]> {
    const users = await db.select().from(usersTable).execute();
    return users.map(DatabaseUserAdapter.toDomain);
  }

  async getPeopleByBirthday(date: Date): Promise<Person[]> {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dateString = `${day}/${month < 10 ? `0${month}` : month}`;
    const users = await db
      .select()
      .from(usersTable)
      .where(like(usersTable.birthDate, `${dateString}%`))
      .execute();

    return users.map(DatabaseUserAdapter.toDomain);
  }
}
