import { PersonRepository } from '@/application/ports/output/person.repository';
import { Person } from '@/domain/entities/person';

export class DatabasePersonRepository implements PersonRepository {
  async getPeople(): Promise<Person[]> {
    return [];
  }
}
