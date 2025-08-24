import { ContactMethodMetadataRepository } from "../../application/ports/output/metadata.repository";
import { SlackMetadata } from "../../domain/value-objects/contact-method-metadata";
import { db } from "../../db";
import { slackMetadata } from "../../db/schema";
import { eq } from "drizzle-orm";

export class SlackMetadataRepository
  implements ContactMethodMetadataRepository<SlackMetadata>
{
  getMetadata(): Record<string, string> {
    return {
      channelId: "string",
      userId: "string",
    };
  }

  async getById(id: number): Promise<SlackMetadata> {
    const [metadata] = await db
      .select()
      .from(slackMetadata)
      .where(eq(slackMetadata.id, id))
      .execute();

    if (!metadata) {
      throw new Error(`No slack metadata found for id ${id}`);
    }

    return {
      id: metadata.id,
      channelId: metadata.channelId,
      userId: metadata.slackUserId,
    };
  }

  async upsert(id: number, metadata: SlackMetadata): Promise<void> {
    await db
      .insert(slackMetadata)
      .values({
        channelId: metadata.channelId,
        slackUserId: metadata.userId,
      })
      .onConflictDoUpdate({
        target: [slackMetadata.id],
        set: {
          channelId: metadata.channelId,
          slackUserId: metadata.userId,
        },
      });
  }
}
