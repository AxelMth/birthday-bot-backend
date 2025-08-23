import { db } from '../../db';
import { contactMethods as contactMethodsTable } from '../../db/schema';

import { DatabaseContactMethodAdapter } from '../adapters/database-contact-method.adapter';
import { ContactMethodRepository } from '../../application/ports/output/contact-method.repository';
import { ContactMethod } from '../../domain/entities/contact-method';

export class DatabaseContactMethodRepository implements ContactMethodRepository {
  async getAllContactMethods(): Promise<ContactMethod[]> {
    const contactMethods = await db.select().from(contactMethodsTable);
    return contactMethods.map(DatabaseContactMethodAdapter.toDomain);
  }
}
