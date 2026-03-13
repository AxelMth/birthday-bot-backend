import {
  ConnectorConfigUseCase,
  ConnectorSchemaField,
} from "../ports/input/connector-config.use-case";
import { ConnectorConfigRepository } from "../ports/output/connector-config.repository";
import { ConnectorConfig } from "../../domain/entities/connector-config";

const INTEGRATION_SCHEMAS: Record<string, ConnectorSchemaField[]> = {
  slack: [
    {
      key: "botToken",
      label: "Bot User OAuth Token",
      type: "string",
      required: true,
      sensitive: true,
      description: "Slack Bot User OAuth Token (xoxb-...)",
    },
  ],
  email: [
    {
      key: "smtpHost",
      label: "SMTP Host",
      type: "string",
      required: true,
      sensitive: false,
    },
    {
      key: "smtpPort",
      label: "SMTP Port",
      type: "number",
      required: true,
      sensitive: false,
    },
    {
      key: "smtpUser",
      label: "SMTP Username",
      type: "string",
      required: true,
      sensitive: false,
    },
    {
      key: "smtpPassword",
      label: "SMTP Password",
      type: "string",
      required: true,
      sensitive: true,
    },
    {
      key: "fromAddress",
      label: "From Email Address",
      type: "string",
      required: true,
      sensitive: false,
    },
  ],
};

export class ConnectorConfigService implements ConnectorConfigUseCase {
  constructor(
    private readonly connectorConfigRepository: ConnectorConfigRepository,
  ) {}

  async getByGroup(groupId: number): Promise<ConnectorConfig[]> {
    return this.connectorConfigRepository.getByGroup(groupId);
  }

  async upsert(
    groupId: number,
    integrationType: string,
    config: Record<string, unknown>,
  ): Promise<ConnectorConfig> {
    return this.connectorConfigRepository.upsert(
      groupId,
      integrationType,
      config,
    );
  }

  async delete(groupId: number, integrationType: string): Promise<void> {
    return this.connectorConfigRepository.delete(groupId, integrationType);
  }

  getSchema(integrationType: string): ConnectorSchemaField[] {
    const schema = INTEGRATION_SCHEMAS[integrationType];
    if (!schema) {
      throw new Error(
        `No schema defined for integration type: ${integrationType}`,
      );
    }
    return schema;
  }
}
