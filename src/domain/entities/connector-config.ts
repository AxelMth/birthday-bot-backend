export class ConnectorConfig {
  constructor(
    public readonly id: number,
    public readonly groupId: number,
    public readonly integrationType: string,
    public config: Record<string, unknown>,
  ) {}
}
