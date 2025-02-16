import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'node:fs/promises';

import { usersTable } from '../schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  db.select().from(usersTable).execute().then(async (users) => {
    for (const user of users) {
      const [date, month, year] = user.birthDate.split('/').map(Number); 
      await db.update(usersTable).set({
        birthDateAsDate: `${year}-${month}-${date}`,
      }).where(eq(usersTable.id, user.id));
    }
  });
}

main();
