import { sql, count, eq } from 'drizzle-orm';

import { PersonRepository } from '../../application/ports/output/person.repository';
import { db } from '../../db';
import { people } from '../../db/schema';
import { Person } from '../../domain/entities/person';
import { DatabasePersonAdapter } from '../adapters/database-person.adapter';

export class DatabasePersonRepository implements PersonRepository {
  async getPersonById(id: number): Promise<Person> {
    const [person] = await db
      .select() 
      .from(people)
      .where(eq(people.id, id))
      .execute();
    return DatabasePersonAdapter.toDomain(person);
  }

  async getPaginatedPeople(
    {
      limit,    
      offset,
      search,
    }: { limit: number; offset: number; search?: string } = {
      limit: 10,
      offset: 0,
    }
  ): Promise<Person[]> {
    const _users = await db
      .select()
      .from(people)
      .where( 
        search ? sql`name ILIKE ${`%${search}%`}` : undefined
      )
      .limit(limit)
      .offset(offset)
      .orderBy(people.name)
      .execute();
    return _users.map(user => DatabasePersonAdapter.toDomain(user));
  }

  async getPeopleCount({
    search,
  }: { search?: string } = {
    search: '',
  }): Promise<number> {
    const [{ count: counter }] = await db
      .select({ count: count() })
      .from(people)
      .where( 
        search ? sql`name ILIKE ${`%${search}%`}` : undefined
      );
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
    return _users.map(user => DatabasePersonAdapter.toDomain(user));
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
    return _users.map(user => DatabasePersonAdapter.toDomain(user));
  }

  async updatePersonById(id: number, person: Person): Promise<void> {
    await db
      .update(people)
      .set({
        name: person.name,
        ...(person.birthdate ? { birthDate: person.birthdate.toISOString().split('T')[0] } : {}),
      })
      .where(eq(people.id, id))
      .execute();
  }

  async createPerson(person: Person): Promise<Person> {
    const [user] = await db
      .insert(people)
      .values({
        name: person.name,
        ...(person.birthdate ? { birthDate: person.birthdate.toISOString().split('T')[0] } : {}),
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
