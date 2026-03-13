import { eq, and } from "drizzle-orm";
import { ConnectorConfigRepository } from "../../application/ports/output/connector-config.repository";
import { ConnectorConfig } from "../../domain/entities/connector-config";
import { db } from "../../db";
import { groupConnectors } from "../../db/schema";

type IntegrationType =
  | "slack"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "telegram";

export class DatabaseConnectorConfigRepository
  implements ConnectorConfigRepository
{
  async getByGroup(groupId: number): Promise<ConnectorConfig[]> {
    const rows = await db
      .select()
      .from(groupConnectors)
      .where(eq(groupConnectors.groupId, groupId));

    return rows.map(
      (r) =>
        new ConnectorConfig(
          r.id,
          r.groupId,
          r.integrationType,
          r.config as Record<string, unknown>,
        ),
    );
  }

  async getByGroupAndType(
    groupId: number,
    integrationType: string,
  ): Promise<ConnectorConfig | null> {
    const [row] = await db
      .select()
      .from(groupConnectors)
      .where(
        and(
          eq(groupConnectors.groupId, groupId),
          eq(
            groupConnectors.integrationType,
            integrationType as IntegrationType,
          ),
        ),
      );

    if (!row) return null;

    return new ConnectorConfig(
      row.id,
      row.groupId,
      row.integrationType,
      row.config as Record<string, unknown>,
    );
  }

  async upsert(
    groupId: number,
    integrationType: string,
    config: Record<string, unknown>,
  ): Promise<ConnectorConfig> {
    const [row] = await db
      .insert(groupConnectors)
      .values({
        groupId,
        integrationType: integrationType as IntegrationType,
        config,
      } as any)
      .onConflictDoUpdate({
        target: [groupConnectors.groupId, groupConnectors.integrationType],
        set: { config } as any,
      })
      .returning();

    return new ConnectorConfig(
      row.id,
      row.groupId,
      row.integrationType,
      row.config as Record<string, unknown>,
    );
  }

  async delete(groupId: number, integrationType: string): Promise<void> {
    await db
      .delete(groupConnectors)
      .where(
        and(
          eq(groupConnectors.groupId, groupId),
          eq(
            groupConnectors.integrationType,
            integrationType as IntegrationType,
          ),
        ),
      );
  }
}
