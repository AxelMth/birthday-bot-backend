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
      personId: metadata[0].slackUserId,
    };
  }
}
