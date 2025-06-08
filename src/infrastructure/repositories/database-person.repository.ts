import { sql, count, eq } from 'drizzle-orm';

import { PersonRepository } from '../../application/ports/output/person.repository';
import { db } from '../../db';
import { people } from '../../db/schema';
import { Person } from '../../domain/entities/person';
import { DatabasePersonAdapter } from '../adapters/database-user.adapter';

export class DatabaseUserRepository implements PersonRepository {
  async getPeopleById(id: number): Promise<Person> {
    const [user] = await db
      .select()
      .from(people)
      .where(eq(people.id, id))
      .execute();
    return DatabasePersonAdapter.toDomain(user);
  }

  async getPaginatedPeople(
    { limit, offset }: { limit: number; offset: number } = {
      limit: 10,
      offset: 0,
    }
  ): Promise<Person[]> {
    const _users = await db
      .select()
      .from(people)
      .limit(limit)
      .offset(offset)
      .orderBy(people.name)
      .execute();
    return _users.map(DatabasePersonAdapter.toDomain);
  }

  async getPeopleCount(): Promise<number> {
    const [{ count: counter }] = await await db
      .select({ count: count() })
      .from(people);
    return counter;
  }

  async getPeopleByBirthday(date: Date): Promise<Person[]> {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const _users = await db
      .select()
      .from(people)
      .where(
        sql`date_part('day', "birthDate") = ${day} and date_part('month', "birthDate") = ${month}`
      )
      .execute();
    return _users.map(DatabasePersonAdapter.toDomain);
  }

  async getPeopleByBirthdayRange(
    startDate: Date,
    endDate: Date
  ): Promise<Person[]> {
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1;
    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const _users = await db
      .select()
      .from(people)
      .where(
        sql`date_part('day', "birthDate") >= ${startDay} and date_part('month', "birthDate") >= ${startMonth} and date_part('day', "birthDate") <= ${endDay} and date_part('month', "birthDate") <= ${endMonth}`
      )
      .execute();
    return _users.map(DatabasePersonAdapter.toDomain);
  }

  async updatePersonById(id: number, person: Person): Promise<void> {
    await db
      .update(people)
      .set({
        name: person.name,
        birthDate: person.birthdate.toISOString(),
      })
      .where(eq(people.id, id))
      .execute();
  }

  async createPerson(person: Person): Promise<Person> {
    const [user] = await db
      .insert(people)
      .values({
        name: person.name,
        birthDate: person.birthdate.toISOString(),
      })
      .returning({
        id: people.id,
        name: people.name,
        birthDate: people.birthDate,
      })
      .execute();
    return DatabasePersonAdapter.toDomain(user);
  }
}
