import { initServer } from "@ts-rest/fastify";
import { connectorContract } from "birthday-bot-contracts";

import { DatabaseConnectorConfigRepository } from "../../infrastructure/repositories/database-connector-config.repository";
import { ConnectorConfigService } from "../../application/services/connector-config.service";

const s = initServer();

const connectorConfigRepository = new DatabaseConnectorConfigRepository();
const connectorConfigService = new ConnectorConfigService(
  connectorConfigRepository,
);

function toConnectorDTO(connector: {
  id: number;
  groupId: number;
  integrationType: string;
  config: Record<string, unknown>;
}) {
  return {
    id: connector.id,
    groupId: connector.groupId,
    integrationType: connector.integrationType,
    config: connector.config as Record<
      string,
      string | number | boolean | null
    >,
  };
}

export const connectorRouter = s.router(connectorContract, {
  getGroupConnectors: async ({ params }) => {
    const connectors = await connectorConfigService.getByGroup(params.groupId);
    return {
      status: 200,
      body: {
        connectors: connectors.map(toConnectorDTO),
      },
    };
  },
  upsertConnector: async ({ params, body }) => {
    const connector = await connectorConfigService.upsert(
      params.groupId,
      params.integrationType,
      body.config,
    );
    return {
      status: 200,
      body: toConnectorDTO(connector),
    };
  },
  deleteConnector: async ({ params }) => {
    await connectorConfigService.delete(
      params.groupId,
      params.integrationType,
    );
    return {
      status: 200,
      body: { success: true },
    };
  },
  getConnectorSchema: async ({ params }) => {
    const fields = connectorConfigService.getSchema(params.integrationType);
    return {
      status: 200,
      body: {
        integrationType: params.integrationType,
        fields,
      },
    };
  },
});
