import { CommunicationRepository } from '../ports/output/communication.repository';
import { CommunicationUseCase } from '../ports/input/communication.use-case';


import { Communication } from '../../domain/entities/communication';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';



export class CommunicationService implements CommunicationUseCase {
  constructor(
    private readonly communicationRepository: CommunicationRepository,
  ) {}

  async upsertCommunicationByPersonId(
    personId: number,
    communication: Communication
  ): Promise<void> {
    const existingCommunications = await this.communicationRepository.getByPersonId(personId);
    const metadataRepository = MetadataRepositoryFactory.getRepository(communication.application)
    if (existingCommunications.length === 0) {
      const createdCommunication = await this.communicationRepository.createCommunication(communication);
      // FIXME: Find a way to type metadata regarding Communication
      await metadataRepository.upsertMetadataForCommunication(createdCommunication.id, communication.metadata as any);
    } else {
      await this.communicationRepository.updateCommunicationsByPersonId(personId, communication);
      // FIXME: Find a way to type metadata regarding Communication
      await metadataRepository.upsertMetadataForCommunication(existingCommunications[0].id, communication.metadata as any);
    }
  }
}