export interface ContactMethodMetadataRepository<T = unknown> {
  getById(id: number): Promise<T>;
  upsert(
    id: number,
    metadata: T
  ): Promise<void>;
}
