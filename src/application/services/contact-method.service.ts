import { ContactMethodRepository } from '../ports/output/contact-method.repository';
import { ContactMethodUseCase } from '../ports/input/contact-method.use-case';
import { ContactMethod } from '../../domain/entities/contact-method';

export class ContactMethodService implements ContactMethodUseCase {
  constructor(
    private readonly contactMethodRepository: ContactMethodRepository,
  ) {}

  async getAllContactMethods(): Promise<ContactMethod[]> {
    return await this.contactMethodRepository.getAllContactMethods();
  }
}