import { Person } from '../../domain/entities/person';

interface DatabaseUser {
  id: number;
  name: string;
  birthDate: string;
}

export class DatabaseUserAdapter {
  static toDomain(user: DatabaseUser): Person {
    return new Person(user.id, user.name, new Date(user.birthDate));
  }
}
