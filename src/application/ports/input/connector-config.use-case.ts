import { ConnectorConfig } from "../../../domain/entities/connector-config";

export interface ConnectorSchemaField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  sensitive: boolean;
  description?: string;
}

export interface ConnectorConfigUseCase {
  getByGroup(groupId: number): Promise<ConnectorConfig[]>;
  upsert(
    groupId: number,
    integrationType: string,
    config: Record<string, unknown>,
  ): Promise<ConnectorConfig>;
  delete(groupId: number, integrationType: string): Promise<void>;
  getSchema(integrationType: string): ConnectorSchemaField[];
}
