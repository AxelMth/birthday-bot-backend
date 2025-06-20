import { Communication } from '../../../domain/entities/communication';

export interface CommunicationUseCase {
  upsertCommunicationByPersonId(
    personId: number,
    communication: Communication
  ): Promise<void>;
}