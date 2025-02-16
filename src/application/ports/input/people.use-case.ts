import { Person } from '../../../domain/entities/person';

export interface PeopleUseCase {
  getPeople(): Promise<Person[]>;
}
