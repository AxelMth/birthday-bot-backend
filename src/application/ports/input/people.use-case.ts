import * as z from 'zod';
import { getPeopleQuerySchema } from 'birthday-bot-contracts';

import { Person } from '../../../domain/entities/person';
import { Application } from '../../../domain/value-objects/application';

export type PaginatedPeopleWithContact = {
  people: PersonWithContact[];
  count: number;
};

export type PersonWithContact = Person & {
  application: Application;
  metadata: Record<string, unknown>;
};

export interface PeopleUseCase {
  getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ): Promise<PaginatedPeopleWithContact>;
  getPersonById(id: number): Promise<PersonWithContact>;
  updatePersonById(
    id: number,
    person: Person
  ): Promise<PersonWithContact>;
}
