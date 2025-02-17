export interface CommunicationMetadataRepository<T = unknown> {
  getMetadataForCommunication(communicationId: number): Promise<T>;
}
