import { ContactMethod } from '../../../domain/entities/contact-method';

export interface ContactMethodRepository {
  getAllContactMethods(): Promise<ContactMethod[]>;
}
