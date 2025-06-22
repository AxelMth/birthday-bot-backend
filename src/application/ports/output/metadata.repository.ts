export interface ContactMethodMetadataRepository<T = unknown> {
  getMetadataForContactMethod(contactMethodId: number): Promise<T>;
  upsertMetadataForContactMethod(
    contactMethodId: number,
    metadata: T
  ): Promise<void>;
}
