import { Person } from '../../../domain/entities/person';

export interface PersonRepository {
  getById(id: number): Promise<Person>;
  getPaginated(params: { search?: string; limit: number; offset: number }): Promise<Person[]>;
  count(params: { search?: string }): Promise<number>;
  getByBirthday(date: Date): Promise<Person[]>;
  getByBirthdayRange(start: Date, end: Date): Promise<Person[]>;
  save(person: Person): Promise<void>; // upsert full aggregate (profile + preferredContact)
  create(person: Person): Promise<Person>;
}
