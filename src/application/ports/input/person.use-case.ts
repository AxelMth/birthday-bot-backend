import { Person } from '@/domain/entities/person';

export interface PersonUseCase {
  getPeople(): Promise<Person[]>;
}
