import { Communication } from "../../../domain/entities/communication";

export interface CommunicationRepository {
  create(communication: Omit<Communication, 'id'>): Promise<Communication>;
}