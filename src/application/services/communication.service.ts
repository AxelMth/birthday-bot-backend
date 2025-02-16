import { CommunicationUseCase } from '../ports/input/communication.use-case';
import { CommunicationRepository } from '../ports/output/communication.repository';

export class CommunicationService implements CommunicationUseCase {
  constructor(private readonly communicationRepository: CommunicationRepository) {}

  async getByPersonId(personId: number) {
    return this.communicationRepository.getByPersonId(personId);
  }
}
