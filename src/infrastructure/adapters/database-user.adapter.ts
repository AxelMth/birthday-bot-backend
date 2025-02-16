import { Person } from '../../domain/entities/person';

interface DatabaseUser {
  id: number;
  name: string;
  birthDate: string;
}

export class DatabaseUserAdapter {
  static toDomain(user: DatabaseUser): Person {
    const [year, month, day] = user.birthDate.split('-').map(Number);
    return new Person(user.id, user.name, new Date(year, month - 1, day));
  }
}
