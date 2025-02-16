import { PersonRepository } from '@/application/ports/output/person.repository';
import { db } from '../../db';
import { users } from '../../db/schema';
import { Person } from '../../domain/entities/person';
import { DatabaseUserAdapter } from '../adapters/database-user.adapter';
import { sql } from 'drizzle-orm';

export class DatabaseUserRepository implements PersonRepository {
  async getPeople(): Promise<Person[]> {
    const _users = await db.select().from(users).execute();
    return _users.map(DatabaseUserAdapter.toDomain);
  }

  async getPeopleByBirthday(date: Date): Promise<Person[]> {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const _users = await db
    .select()
    .from(users)
    .where(sql`date_part('day', "birthDate") = ${day} and date_part('month', "birthDate") = ${month}`)
      .execute();
    return _users.map(DatabaseUserAdapter.toDomain);
  }
}
