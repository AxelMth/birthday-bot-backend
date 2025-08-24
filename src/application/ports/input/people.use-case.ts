import * as z from 'zod';
import { getPeopleQuerySchema } from 'birthday-bot-contracts';

import { Person } from '../../../domain/entities/person';


export interface PeopleUseCase {
  getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ): Promise<{
    people: Person[];
    count: number;
  }>;
  getPersonById(id: number): Promise<Person>;
  updatePersonById(
    id: number,
    person: Person
  ): Promise<Person>;
}
