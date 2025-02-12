import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'node:fs/promises';

import { usersTable } from '../schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const users = await fs.readFile('users.csv', 'utf-8');

  for (const user of users.split('\n')) {
    const [name, , birthDate] = user.split(';');
    if (!name || !birthDate) {
      continue;
    }
    await db.insert(usersTable).values({
      name,
      birthDate,
    });
  }
}

main();
