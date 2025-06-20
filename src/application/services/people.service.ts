import * as z from 'zod';
import {
  getPeopleQuerySchema,
  createPersonBodySchema,
  updatePersonByIdBodySchema,
} from 'birthday-bot-contracts';

import { CommunicationRepository } from '../ports/output/communication.repository';
import { PersonRepository } from '../ports/output/person.repository';
import {
  PaginatedPeopleWithCommunications,
  PeopleUseCase,
} from '../ports/input/people.use-case';
import { Person } from '../../domain/entities/person';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';
import { Application } from '../../domain/value-objects/application';
import { Communication } from '../../domain/entities/communication';

export class PeopleService implements PeopleUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly communicationRepository: CommunicationRepository,
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
  ): Promise<PaginatedPeopleWithCommunications> {
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
    const peopleWithCommunications = await Promise.all(
      people.map((person) => {
        return this.getPersonById(person.id);
      })
    );
    return {
      people: peopleWithCommunications,
      count: peopleCount,
    };
  }

  async getPersonById(id: number) {
    const person = await this.personRepository.getPeopleById(id);
    const communications = await this.communicationRepository.getByPersonId(
      person.id
    );
    const communicationsWithMetadata = [];
    for (const communication of communications) {
      const metadataRepository = MetadataRepositoryFactory.getRepository(
        communication.application
      );
      const metadata = await metadataRepository.getMetadataForCommunication(
        communication.id
      ).catch(() => {
        return null;
      });
      communicationsWithMetadata.push({ ...communication, metadata });
    }
    return { ...person, communications: communicationsWithMetadata };
  }
}
