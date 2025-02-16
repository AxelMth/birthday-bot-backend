import { Person } from '../../../domain/entities/person';

export interface PeopleUseCase {
  getPeople(): Promise<Person[]>;
  getPeopleByBirthday(date: Date): Promise<Person[]>;
}
