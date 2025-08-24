import * as z from 'zod';
import {
  getPeopleQuerySchema,
  createPersonBodySchema,
  updatePersonByIdBodySchema,
} from 'birthday-bot-contracts';

import { PersonRepository } from '../ports/output/person.repository';
import {
  PeopleUseCase,
} from '../ports/input/people.use-case';
import { Person } from '../../domain/entities/person';
import { Application } from '../../domain/value-objects/application';
import { ContactChannel } from '../../domain/value-objects/contact-info';

export class PeopleService implements PeopleUseCase {
  constructor(
    private readonly personRepository: PersonRepository
  ) {}

  private toContactChannel(body: {
    application?: string;
    applicationMetadata?: Record<string, string | number | boolean>;
  }): ContactChannel | undefined {
    if (!body.application) return undefined;
    switch (body.application) {
      case Application.Slack:
        return {
          kind: Application.Slack,
          info: {
            channelId: String(body.applicationMetadata?.channelId ?? ''),
            userId: String(body.applicationMetadata?.userId ?? ''),
          },
        };
      default:
        throw new Error(`Unsupported application: ${body.application}`);
    }
  }

  async createPerson(personPayload: z.infer<typeof createPersonBodySchema>) {
    const person = new Person(
      0,
      personPayload.name!,
      personPayload.birthDate ? new Date(personPayload.birthDate) : undefined
    );  
    person.setPreferredContact(this.toContactChannel(personPayload)); 
    const created = await this.personRepository.create(person);
    return await this.personRepository.getById(created.id);
  }

  async updatePersonById(
    id: number,
    personPayload: z.infer<typeof updatePersonByIdBodySchema>
  ) {
    const person = await this.personRepository.getById(id);
    person.updateProfile(
      personPayload.name!,
      personPayload.birthDate ? new Date(personPayload.birthDate) : undefined,
    );
    person.setPreferredContact(this.toContactChannel(personPayload));
    await this.personRepository.save(person);
    return await this.personRepository.getById(id);
  }

  async getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ) {
    const searchParams = query.search ? { search: query.search } : {};
    const peopleCount = await this.personRepository.count(searchParams);
    const limit = query.pageSize ?? 10;
    const offset = (query.pageSize ?? 10) * ((query.pageNumber ?? 1) - 1);
    const people = await this.personRepository.getPaginated({
      limit,  
      offset,
      ...searchParams,
    });
    return {  
      people,
      count: peopleCount,
    };
  }

  async getPersonById(id: number) {
    return await this.personRepository.getById(id);
  }
}
