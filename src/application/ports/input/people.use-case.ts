import * as z from 'zod';
import { getPeopleQuerySchema } from 'birthday-bot-contracts';

import { Person } from '../../../domain/entities/person';
import { Communication } from '../../../domain/entities/communication';

export type PaginatedPeopleWithCommunications = {
  people: PersonWithCommunications[];
  count: number;
};

export type PersonWithCommunications = Person & {
  communications: CommunicationWithMetadata[];
};

export type CommunicationWithMetadata = Communication & {
  metadata: unknown;
};

export interface PeopleUseCase {
  getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ): Promise<PaginatedPeopleWithCommunications>;
  getPersonById(id: number): Promise<PersonWithCommunications>;
  updatePersonById(
    id: number,
    person: Person
  ): Promise<PersonWithCommunications>;
}
