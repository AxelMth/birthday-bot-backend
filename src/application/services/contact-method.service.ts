import { ContactMethodRepository } from '../ports/output/contact-method.repository';
import { ContactMethodUseCase } from '../ports/input/contact-method.use-case';

import { ContactMethod } from '../../domain/entities/contact-method';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';

export class ContactMethodService implements ContactMethodUseCase {
  constructor(
    private readonly contactMethodRepository: ContactMethodRepository,
  ) {}

  async getAllContactMethods(): Promise<ContactMethod[]> {
    return await this.contactMethodRepository.getAllContactMethods();
  }

  async upsertContactMethodByPersonId(
    personId: number,
    contactMethod: ContactMethod
  ): Promise<void> {
    const existingContactMethod = await this.contactMethodRepository.getByPersonId(personId);
    const metadataRepository = MetadataRepositoryFactory.getRepository(contactMethod.application)
    if (!existingContactMethod) {
      const createdContactMethod = await this.contactMethodRepository.createContactMethod(contactMethod);
      // FIXME: Find a way to type metadata regarding ContactMethod
      await metadataRepository.upsertMetadataForContactMethod(createdContactMethod.id, contactMethod.metadata as any);
    } else {
      await this.contactMethodRepository.updateContactMethodByPersonId(personId, contactMethod);
      // FIXME: Find a way to type metadata regarding ContactMethod
      await metadataRepository.upsertMetadataForContactMethod(existingContactMethod.id, contactMethod.metadata as any);
    }
  }
}