import * as z from 'zod';
import { 
  getPeopleQuerySchema,
  createPersonBodySchema,
  updatePersonByIdBodySchema 
} from 'birthday-bot-contracts';

import { Person } from '../../../domain/entities/person';

export interface PeopleUseCase {
  getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ): Promise<{
    people: Person[];
    count: number;
  }>;
  getPersonById(id: number): Promise<Person>;
  createPerson(personPayload: z.infer<typeof createPersonBodySchema>): Promise<Person>;
  updatePersonById(
    id: number,
    personPayload: z.infer<typeof updatePersonByIdBodySchema>
  ): Promise<Person>;
}
