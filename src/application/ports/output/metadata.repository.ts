export interface ContactMethodMetadataRepository<T = unknown> {
  getMetadata(): Record<string, string>;
  getById(id: number): Promise<T>;
  upsert(
    id: number,
    metadata: T
  ): Promise<void>;
}
