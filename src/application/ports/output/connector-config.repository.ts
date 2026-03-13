import { ConnectorConfig } from "../../../domain/entities/connector-config";

export interface ConnectorConfigRepository {
  getByGroup(groupId: number): Promise<ConnectorConfig[]>;
  getByGroupAndType(
    groupId: number,
    integrationType: string,
  ): Promise<ConnectorConfig | null>;
  upsert(
    groupId: number,
    integrationType: string,
    config: Record<string, unknown>,
  ): Promise<ConnectorConfig>;
  delete(groupId: number, integrationType: string): Promise<void>;
}
