import * as z from 'zod';
import {
  getPeopleQuerySchema,
  createPersonBodySchema,
  updatePersonByIdBodySchema,
} from 'birthday-bot-contracts';

import { ContactMethodRepository } from '../ports/output/contact-method.repository';
import { PersonRepository } from '../ports/output/person.repository';
import {
  PaginatedPeopleWithContact,
  PeopleUseCase,
} from '../ports/input/people.use-case';
import { Person } from '../../domain/entities/person';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';

export class PeopleService implements PeopleUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly contactMethodRepository: ContactMethodRepository,
  ) {}

  async createPerson(personPayload: z.infer<typeof createPersonBodySchema>) {
    const personToCreate = new Person(
      0,
      personPayload.name!,
      personPayload.birthdate!
    );
    const person = await this.personRepository.createPerson(personToCreate);
    return this.getPersonById(person.id);
  }

  async updatePersonById(
    id: number,
    personPayload: z.infer<typeof updatePersonByIdBodySchema>
  ) {
    const personToUpdate = new Person(
      id,
      personPayload.name!,
      personPayload.birthdate!
    );
    await this.personRepository.updatePersonById(id, personToUpdate);
    return this.getPersonById(id);
  }

  async getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ): Promise<PaginatedPeopleWithContact> {
    const peopleCount = await this.personRepository.getPeopleCount({
      ...(query.search ? { search: query.search } : {}),
    });
    const limit = query.pageSize ?? 10;
    const offset = (query.pageSize ?? 10) * ((query.pageNumber ?? 1) - 1);
    const people = await this.personRepository.getPaginatedPeople({
      limit,  
      offset,
      ...(query.search ? { search: query.search } : {}),
    });
    const peopleWithContactMethods = await Promise.all(
      people.map((person) => {
        return this.getPersonById(person.id);
      })
    );
    return {
      people: peopleWithContactMethods,
      count: peopleCount,
    };
  }

  async getPersonById(id: number) {
    const person = await this.personRepository.getPeopleById(id);
    const contactMethod = await this.contactMethodRepository.getByPersonId(
      person.id
    );
    const metadataRepository = MetadataRepositoryFactory.getRepository(
      contactMethod.application
    );
    const metadata = await metadataRepository.getMetadataForContactMethod(
      contactMethod.id
    ).catch(() => {
      return null;
    });
    return { ...person, application: contactMethod.application, metadata };
  }
}
