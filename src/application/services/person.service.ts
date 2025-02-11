import { Person } from '@/domain/entities/person';
import { PersonUseCase } from '../ports/input/person.use-case';
import { PersonRepository } from '../ports/output/person.repository';

export class PersonService implements PersonUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async syncPeople(): Promise<Person[]> {
    return this.personRepository.getPeople();
  }
}
