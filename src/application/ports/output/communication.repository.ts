import { Communication } from '@/domain/entities/communication';

export interface CommunicationRepository {
  getByPersonId(personId: number): Promise<Communication[]>;
}
