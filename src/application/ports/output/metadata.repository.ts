export interface CommunicationMetadataRepository<T = unknown> {
  getMetadataForCommunication(communicationId: number): Promise<T>;
  upsertMetadataForCommunication(
    communicationId: number,
    metadata: T
  ): Promise<void>;
}
