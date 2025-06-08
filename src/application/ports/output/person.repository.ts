import { Person } from '../../../domain/entities/person';

export interface PersonRepository {
  getPeopleById(id: number): Promise<Person>;
  getPaginatedPeople({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): Promise<Person[]>;
  getPeopleCount(): Promise<number>;
  getPeopleByBirthday(date: Date): Promise<Person[]>;
  getPeopleByBirthdayRange(startDate: Date, endDate: Date): Promise<Person[]>;
  updatePersonById(id: number, person: Person): Promise<void>;
  createPerson(person: Person): Promise<Person>;
}
