import { Person } from '../../../domain/entities/person';

export interface BirthdayMessageRepository<M = any> {
  sendMessage(message: string, metadata: M): Promise<void>;
}
