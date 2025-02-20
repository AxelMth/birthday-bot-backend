import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

import { contactMethods, people } from '../schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const _people = await db.select().from(people);
  for (const person of _people) {
    console.log(`Creating contact methods for ${person.name}`);
    await db.insert(contactMethods).values({
      personId: person.id,
      application: 'slack',
    });
  }
}

main();
