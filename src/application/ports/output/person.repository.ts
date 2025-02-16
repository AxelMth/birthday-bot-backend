import { Person } from '../../../domain/entities/person';

export interface PersonRepository {
  getPeople(): Promise<Person[]>;
  getPeopleByBirthday(date: Date): Promise<Person[]>;
}
