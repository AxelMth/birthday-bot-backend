import { Person } from '../../../domain/entities/person';

export interface PersonRepository {
  getPeopleById(id: number): Promise<Person>;
  getPaginatedPeople({
    search,
    limit,
    offset,
  }: {
    search?: string;
    limit: number;
    offset: number;
  }): Promise<Person[]>;
  getPeopleCount({
    search,
  }: { search?: string }): Promise<number>;
  getPeopleByBirthday(date: Date): Promise<Person[]>;
  getPeopleByBirthdayRange(startDate: Date, endDate: Date): Promise<Person[]>;
  updatePersonById(id: number, person: Person): Promise<void>;
  createPerson(person: Person): Promise<Person>;
}
