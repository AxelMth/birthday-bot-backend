import { ContactMethod } from '../../domain/entities/contact-method';
import { ContactMethodMetadata } from '../../domain/value-objects/contact-method-metadata';
import { Person } from '../../domain/entities/person';
import { PersonRepository } from '../ports/output/person.repository';
import { PersonContactMethodRepository } from '../ports/output/person-contact-method.repository';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';
import { ContactMethodMetadataRepository } from '../ports/output/metadata.repository';

export class PeopleContactMethodService {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly personContactMethodRepository: PersonContactMethodRepository,
  ) {}

  async getPersonWithContactMethod(personId: number): Promise<Person> {
    // Get the base person data
    const person = await this.personRepository.getPersonById(personId);
    
    // Get their contact method data
    const contactMethodData = await this.personContactMethodRepository.getByPersonId(personId);
    
    if (!contactMethodData) {
      return person; // Return person without contact method
    }

    const metadataRepository = MetadataRepositoryFactory.getRepository(contactMethodData.contactMethod.applicationName);
    const contactMethodMetadata = await metadataRepository.getMetadataForContactMethod(contactMethodData.contactMethod.id);

    // Create a new Person with contact method data
    return new Person(
      person.id,
      person.name,
      person.birthdate,
      contactMethodData.contactMethod,
      contactMethodMetadata as any // TODO: fix this
    );
  }

  async assignContactMethodToPerson(
    personId: number,
    contactMethod: ContactMethod,
    metadataRelationId: number
  ): Promise<void> {
    await this.personContactMethodRepository.createContactMethod(
      personId,
      contactMethod,
      metadataRelationId
    );
  }

  async updatePersonContactMethod(
    personId: number,
    contactMethod: ContactMethod,
    metadataRelationId: number
  ): Promise<void> {
    await this.personContactMethodRepository.updateContactMethodById(
      personId,
      contactMethod,
      metadataRelationId
    );
  }

  async upsertPersonContactMethod(
    personId: number,
    contactMethod: ContactMethod,
    contactMethodMetadata: ContactMethodMetadata[keyof ContactMethodMetadata]
  ): Promise<void> {
    const existingContactMethod = await this.personContactMethodRepository.getByPersonId(personId);
    const metadataRepository = MetadataRepositoryFactory.getRepository(contactMethod.applicationName);
    
    if (!existingContactMethod) {
      const createdRelation = await this.personContactMethodRepository.createContactMethod(
        personId,
        contactMethod,
        0 // You'll need to handle metadata ID properly
      );
      await metadataRepository.upsertMetadataForContactMethod(
        createdRelation.contactMethod.id,
        contactMethodMetadata
      );
    } else {
      await this.personContactMethodRepository.updateContactMethodByPersonId(
        personId,
        contactMethod
      );
      await metadataRepository.upsertMetadataForContactMethod(
        existingContactMethod.contactMethod.id,
        contactMethodMetadata as any // TODO: fix this
      );
    }
  }
}
