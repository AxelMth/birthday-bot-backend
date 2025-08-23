import { ContactMethod } from '../../../domain/entities/contact-method';

export interface ContactMethodUseCase {
  getAllContactMethods(): Promise<ContactMethod[]>;
  upsertContactMethodByPersonId(
    personId: number,
    contactMethod: ContactMethod
  ): Promise<void>;
}