import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { 
  peopleContactMethods, 
  contactMethods, 
  slackMetadata 
} from '../../db/schema';
import { PersonContactMethodRepository } from '../../application/ports/output/person-contact-method.repository';
import { ContactMethod } from '../../domain/entities/contact-method';
import { ContactMethodMetadata } from '../../domain/value-objects/contact-method-metadata';
import { DatabaseContactMethodAdapter } from '../adapters/database-contact-method.adapter';

export class DatabasePersonContactMethodRepository implements PersonContactMethodRepository {
  async getByPersonId(personId: number): Promise<{
    contactMethod: ContactMethod;
    contactMethodMetadata: ContactMethodMetadata[keyof ContactMethodMetadata];
  } | null> {
    const [result] = await db
      .select({
        contactMethodId: contactMethods.id,
        applicationName: contactMethods.applicationName,
        slackMetadataId: slackMetadata.id,
        channelId: slackMetadata.channelId,
        slackUserId: slackMetadata.slackUserId,
      })
      .from(peopleContactMethods)
      .innerJoin(contactMethods, eq(peopleContactMethods.contactMethodId, contactMethods.id))
      .leftJoin(slackMetadata, eq(peopleContactMethods.slackMetadataId, slackMetadata.id))
      .where(eq(peopleContactMethods.personId, personId));

    if (!result) return null;

    const contactMethod = DatabaseContactMethodAdapter.toDomain({
      id: result.contactMethodId,
      applicationName: result.applicationName,
    });

    const contactMethodMetadata = result.channelId && result.slackUserId 
      ? { id: result.slackMetadataId, channelId: result.channelId, userId: result.slackUserId }
      : null;

    return {
      contactMethod,
      contactMethodMetadata: contactMethodMetadata as any,
    };
  }

  async createContactMethod(
    personId: number,
    contactMethod: ContactMethod,
    metadataRelationId: number
  ): Promise<{
    contactMethod: ContactMethod;
    contactMethodMetadata: ContactMethodMetadata[keyof ContactMethodMetadata];
  }> {
    const [created] = await db
      .insert(peopleContactMethods)
      .values({
        personId,
        contactMethodId: contactMethod.id,
        ...(contactMethod.applicationName === 'slack' && {
          slackMetadataId: metadataRelationId,
        }),
      })
      .returning({
        contactMethodId: contactMethods.id,
        applicationName: contactMethods.applicationName,
        slackMetadataId: slackMetadata.id,
      });

    const createdContactMethod = DatabaseContactMethodAdapter.toDomain({
      id: created.contactMethodId,
      applicationName: created.applicationName,
    });

    return {
      contactMethod: createdContactMethod,
      contactMethodMetadata: null as any, // Will be populated by metadata service
    };
  }

  async updateContactMethodById(
    personId: number,
    contactMethod: ContactMethod,
    metadataRelationId: number
  ): Promise<void> {
    await db
      .update(peopleContactMethods)
      .set({
        contactMethodId: contactMethod.id,
        ...(contactMethod.applicationName === 'slack' && {
          slackMetadataId: metadataRelationId,
        }),
      })
      .where(eq(peopleContactMethods.personId, personId));
  }

  async updateContactMethodByPersonId(
    personId: number,
    contactMethod: ContactMethod
  ): Promise<void> {
    await db
      .update(peopleContactMethods)
      .set({
        contactMethodId: contactMethod.id,
      })
      .where(eq(peopleContactMethods.personId, personId));
  }
}
