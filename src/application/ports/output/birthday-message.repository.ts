import { Person } from '@/domain/entities/person';

export interface BirthdayMessageRepository {
  sendMessage(person: Person, message: string): Promise<void>;
}
