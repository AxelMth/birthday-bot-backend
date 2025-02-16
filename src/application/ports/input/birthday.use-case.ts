import { Person } from '../../../domain/entities/person';

export interface BirthdayUseCase {
  sendTodayBirthdayMessages(people: Person[]): Promise<void>;
}
