import { Person } from '@/domain/entities/person';
import { PeopleUseCase } from '../ports/input/people.use-case';
import { PersonRepository } from '../ports/output/person.repository';

export class PeopleService implements PeopleUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async getPeople(): Promise<Person[]> {
    return this.personRepository.getPeople();
  }

  async getPeopleByBirthday(date: Date): Promise<Person[]> {
    return this.personRepository.getPeopleByBirthday(date);
  }
}
