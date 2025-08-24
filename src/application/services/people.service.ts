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
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';
import { PersonContactMethodRepository } from '../ports/output/person-contact-method.repository';
import { ContactMethodMetadata } from '../../domain/value-objects/contact-method-metadata';
import { ContactMethod } from '../../domain/entities/contact-method';
import { Application } from '../../domain/value-objects/application';

export class PeopleService implements PeopleUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly personContactMethodRepository: PersonContactMethodRepository
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
      personPayload.birthdate!,
    );
    // We need to update the person and the contact method
    await this.personRepository.updatePersonById(id, personToUpdate);
    const contactMethod = await this.personContactMethodRepository.getByPersonId(id);
    if (!contactMethod) {
      await this.personContactMethodRepository.createContactMethod(id, new ContactMethod(
        0,
        personPayload.application! as Application,
        personPayload.applicationMetadata! as unknown as Record<string, string> // TODO: fix this
      ));
    } else if (contactMethod.contactMethod.applicationName !== personPayload.application) {
      await this.personContactMethodRepository.updateContactMethodById(id, new ContactMethod(
        contactMethod.contactMethod.id,
        personPayload.application! as Application,
        personPayload.applicationMetadata! as unknown as Record<string, string> // TODO: fix this
      ));
    }
    return this.getPersonById(id);
  }

  async getPaginatedPeople(
    query: z.infer<typeof getPeopleQuerySchema>
  ) {
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
    const person = await this.personRepository.getPersonById(id);
    const personContactMethod = await this.personContactMethodRepository.getByPersonId(id);
    if (!personContactMethod) {
      return new Person(
        person.id,
        person.name,
        person.birthDate,
        null,
        null
      );
    }
    const { contactMethod, contactMethodMetadata } = personContactMethod;
    if (!contactMethodMetadata) {
      return new Person(
        person.id,
        person.name,
        person.birthDate,
        contactMethod,
        null
      );
    }
    const metadataRepository = MetadataRepositoryFactory.getRepository(contactMethod.applicationName);
    const metadata = await metadataRepository.getById(contactMethodMetadata.id);
    return new Person(
      person.id,
      person.name,
      person.birthDate,
      contactMethod,
      metadata as unknown as ContactMethodMetadata // TODO: fix this
    );
  }
}
