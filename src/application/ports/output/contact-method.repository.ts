import { ContactMethod } from '../../../domain/entities/contact-method';

export interface ContactMethodRepository {
  getByPersonId(personId: number): Promise<ContactMethod>;
  createContactMethod(contactMethod: ContactMethod): Promise<ContactMethod>;
  updateContactMethodById(
    id: number,
    contactMethod: ContactMethod
  ): Promise<void>;
  updateContactMethodByPersonId(
    personId: number,
    contactMethod: ContactMethod
  ): Promise<void>;
}
