import { Communication } from '../../../domain/entities/communication';

export interface CommunicationRepository {
  getByPersonId(personId: number): Promise<Communication[]>;
  createCommunication(communication: Communication): Promise<Communication>;
  updateCommunicationById(
    id: number,
    communication: Communication
  ): Promise<void>;
}
