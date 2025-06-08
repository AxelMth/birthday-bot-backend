import { Person } from '../../../domain/entities/person';

export interface BirthdayUseCase {
  sendTodayBirthdayMessages(people: Person[]): Promise<{
    birthdayMessageCount: number;
    people?: Person[];
  }>;
  getNextBirthdaysUntil(date: Date): Promise<Person[]>;
}
