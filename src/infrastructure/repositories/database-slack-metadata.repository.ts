import { CommunicationMetadataRepository } from '../../application/ports/output/metadata.repository';
import { SlackMetadata } from '../../domain/value-objects/communication-metadata';
import { db } from '../../db';
import { slackMetadata } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class SlackMetadataRepository
  implements CommunicationMetadataRepository<SlackMetadata>
{
  async getMetadataForCommunication(
    communicationId: number
  ): Promise<SlackMetadata> {
    const metadata = await db
      .select()
      .from(slackMetadata)
      .where(eq(slackMetadata.contactMethodId, communicationId))
      .execute();

    if (!metadata[0]) {
      throw new Error(
        `No slack metadata found for communication ${communicationId}`
      );
    }

    return {
      channelId: metadata[0].channelId,
      userId: metadata[0].slackUserId,
    };
  }

  async upsertMetadataForCommunication(
    communicationId: number,
    metadata: SlackMetadata
  ): Promise<void> {
    await db
      .insert(slackMetadata)
      .values({
        contactMethodId: communicationId,
        channelId: metadata.channelId,
        slackUserId: metadata.userId,
      })
      .onConflictDoUpdate({
        target: [slackMetadata.contactMethodId],
        set: {
          channelId: metadata.channelId,
          slackUserId: metadata.userId,
        },
      });
  }
}
