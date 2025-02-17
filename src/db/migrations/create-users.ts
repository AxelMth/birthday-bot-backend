import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'node:fs/promises';

import { people } from '../schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const usersFromCSV = await fs.readFile('users.csv', 'utf-8');

  for (const user of usersFromCSV.split('\n')) {
    const [name, , birthDate] = user.split(';');
    if (!name || !birthDate) {
      continue;
    }
    await db.insert(people).values({
      name,
      birthDate,
    });
  }
}

main();
