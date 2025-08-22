import { Person } from '../../domain/entities/person';

interface DatabasePerson {
  id: number;
  name: string;
  birthDate: string | null;
}

export class DatabasePersonAdapter {
  static toDomain(user: DatabasePerson): Person {
    if (!user.birthDate) {
      return new Person(user.id, user.name, null);
    }
    
    const [year, month, day] = user.birthDate.split('-').map(Number);
    const birthDate = new Date(Date.UTC(year, month - 1, day));
    return new Person(user.id, user.name, birthDate);
  }
}
