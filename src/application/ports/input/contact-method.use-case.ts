import { ContactMethod } from '../../../domain/entities/contact-method';

export interface ContactMethodUseCase {
  upsertContactMethodByPersonId(
    personId: number,
    contactMethod: ContactMethod
  ): Promise<void>;
}