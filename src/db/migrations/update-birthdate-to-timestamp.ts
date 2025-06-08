import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

import { people } from '../schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  db.select()
    .from(people)
    .execute()
    .then(async (_users) => {
      for (const user of _users) {
        const [date, month, year] = user.birthDate.split('/').map(Number);
        await db
          .update(people)
          .set({
            // @ts-expect-error At the time of writing, the schema did not have birthDateAsDate column
            birthDateAsDate: `${year}-${month}-${date}`,
          })
          .where(eq(people.id, user.id));
      }
    });
}

main();
