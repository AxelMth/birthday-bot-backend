import * as z from 'zod';
import { getPeopleQuerySchema } from 'birthday-bot-contracts';

import { Person } from '../../../domain/entities/person';
import { ContactMethod } from '../../../domain/entities/contact-method';

export type PaginatedPeopleWithContactMethod = {
  people: PersonWithContactMethod[];
  count: number;
};

export type PersonWithContactMethod = Person & {
  contactMethod: ContactMethodWithMetadata;
};

export type ContactMethodWithMetadata = ContactMethod & {
  metadata: Record<string, unknown>;
};

export interface PeopleUseCase {
  getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ): Promise<PaginatedPeopleWithContactMethod>;
  getPersonById(id: number): Promise<PersonWithContactMethod>;
  updatePersonById(
    id: number,
    person: Person
  ): Promise<PersonWithContactMethod>;
}
