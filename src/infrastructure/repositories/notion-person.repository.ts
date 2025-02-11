import { PersonRepository } from '@/application/ports/output/person.repository';
import { Person } from '@/domain/entities/person';

export class NotionPersonRepository implements PersonRepository {
  async getPeople(): Promise<Person[]> {
    // Implementation here
    return [];
  }
}
