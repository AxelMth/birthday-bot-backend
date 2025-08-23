import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { contactMethods, slackMetadata } from '../../db/schema';
import { DatabaseContactMethodAdapter } from '../adapters/database-contact-method.adapter';
import { ContactMethodRepository } from '../../application/ports/output/contact-method.repository';
import { ContactMethod } from '../../domain/entities/contact-method';
import { MetadataRepositoryFactory } from '../factories/metadata-repository.factory';

export class DatabaseContactMethodRepository
  implements ContactMethodRepository
{
  async getByPersonId(personId: number): Promise<ContactMethod> {
    const _contactMethods = await db
      .select()
      .from(contactMethods)
      .where(eq(contactMethods.personId, personId));
    return DatabaseContactMethodAdapter.toDomain(_contactMethods[0]);
  }

  async getAllContactMethods(): Promise<ContactMethod[]> {
    const _contactMethods = await db
      .select()
      .from(contactMethods)
      .leftJoin(slackMetadata, eq(contactMethods.id, slackMetadata.contactMethodId));

    const contactMethodsWithMetadata = await Promise.all(
      _contactMethods.map(async (row) => {
        const contactMethod = DatabaseContactMethodAdapter.toDomain(row.contact_methods);
        
        try {
          const metadataRepository = MetadataRepositoryFactory.getRepository(contactMethod.application);
          const metadata = await metadataRepository.getMetadataForContactMethod(contactMethod.id);
          return new ContactMethod(
            contactMethod.id,
            contactMethod.personId,
            contactMethod.application,
            metadata as unknown as Record<string, string | number | boolean>
          );
        } catch (error) {
          // If no metadata found, return contact method with empty metadata
          return contactMethod;
        }
      })
    );

    return contactMethodsWithMetadata;
  }

  async createContactMethod(
    contactMethod: ContactMethod
  ): Promise<ContactMethod> {
    const result = await db
      .insert(contactMethods)
      .values({
        personId: contactMethod.personId,
        application: contactMethod.application,
      });
    return new ContactMethod(result.id, contactMethod.personId, contactMethod.application, {});
  }

  async updateContactMethodById(
    id: number,
    contactMethod: ContactMethod
  ): Promise<void> {
    await db
      .update(contactMethods)
      .set(DatabaseContactMethodAdapter.toDatabase(contactMethod))
      .where(eq(contactMethods.id, id));
  }

  async updateContactMethodByPersonId(
    personId: number,
    contactMethod: ContactMethod
  ): Promise<void> {
    await db
      .update(contactMethods)
      .set({
        personId: contactMethod.personId,
        application: contactMethod.application,
      })
      .where(eq(contactMethods.personId, personId));
  }
}
