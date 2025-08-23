import { ContactMethod } from '../../../domain/entities/contact-method';
import { ContactMethodMetadata } from '../../../domain/value-objects/contact-method-metadata';

export interface PersonContactMethodRepository {
  getByPersonId(personId: number): Promise<{
    contactMethod: ContactMethod;
    contactMethodMetadata: ContactMethodMetadata[keyof ContactMethodMetadata];
  }>;
  createContactMethod(personId: number, contactMethod: ContactMethod, metadataRelationId: number): Promise<{
    contactMethod: ContactMethod;
    contactMethodMetadata: ContactMethodMetadata[keyof ContactMethodMetadata];
  }>;
  updateContactMethodById(  
    personId: number,
    contactMethod: ContactMethod,
    metadataRelationId: number
  ): Promise<void>; 
  updateContactMethodByPersonId(
    personId: number,
    contactMethod: ContactMethod
  ): Promise<void>;
}
