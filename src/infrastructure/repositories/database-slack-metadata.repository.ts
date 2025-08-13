import { ContactMethodMetadataRepository } from '../../application/ports/output/metadata.repository';
import { SlackMetadata } from '../../domain/value-objects/contact-method-metadata';
import { db } from '../../db';
import { slackMetadata } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class SlackMetadataRepository
  implements ContactMethodMetadataRepository<SlackMetadata>
{
  async getMetadataForContactMethod(
    contactMethodId: number
  ): Promise<SlackMetadata> {
    const metadata = await db
        .select()
        .from(slackMetadata)
      .where(eq(slackMetadata.contactMethodId, contactMethodId))
      .execute();

    if (!metadata[0]) {
      throw new Error(
        `No slack metadata found for contactMethod ${contactMethodId}`
      );
    }

    return {
      webhookUrl: metadata[0].webhookUrl,
      userId: metadata[0].slackUserId,
    };
  }

  async upsertMetadataForContactMethod(
    contactMethodId: number,
    metadata: SlackMetadata
  ): Promise<void> {
    await db
      .insert(slackMetadata)
      .values({
        contactMethodId: contactMethodId,
        webhookUrl: metadata.webhookUrl,
        slackUserId: metadata.userId,
      })
      .onConflictDoUpdate({
        target: [slackMetadata.contactMethodId],
        set: {
          webhookUrl: metadata.webhookUrl,
          slackUserId: metadata.userId,
        },
      });
  }
}