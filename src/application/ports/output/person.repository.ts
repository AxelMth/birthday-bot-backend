import { Person } from "../../../domain/entities/person";

export interface PersonRepository {
  getById(id: number): Promise<Person>;
  getByIds(ids: number[]): Promise<Person[]>;
  getPaginated(params: {
    search?: string;
    limit: number;
    offset: number;
    sort?: "birthDate" | "name";
    order?: "asc" | "desc";
    groupId?: number;
  }): Promise<Person[]>;
  count(params: { search?: string; groupId?: number }): Promise<number>;
  getByBirthday(date: Date): Promise<Person[]>;
  getByBirthdayRange(start: Date, end: Date): Promise<Person[]>;
  save(person: Person): Promise<void>;
  create(person: Person): Promise<Person>;
  delete(id: number): Promise<void>;
}
