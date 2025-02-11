import { z } from 'zod';

import { notionResponseSchema } from '../../presentation/schemas/notion-person.schema';
import { Person } from '@/domain/entities/person';

export class NotionPersonAdapter {
  static toDomain(notionData: z.infer<typeof notionResponseSchema>): Person {
    return new Person(
      notionData.id,
      notionData.name,
      new Date(notionData.birthdate)
    );
  }
}
