import { Person } from '@/domain/entities/person';

export interface PersonUseCase {
  syncPeople(): Promise<Person[]>;
}
