import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, ilike } from 'drizzle-orm';
import fs from 'node:fs/promises';

import { contactMethods, people, slackMetadata } from '../schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const content = (await fs.readFile('slack_ids.csv', 'utf-8')).split('\n');
  const peopleNamesWithSlackIds = content.map(line => line.split(';'));
  for (const [name, slackId] of peopleNamesWithSlackIds) {
    if (!name || !slackId) {
      continue;
    }
    const person = await db
      .select()
      .from(people)
      .where(ilike(people.name, name))
      .execute();
    if (person.length === 0) {
      console.log(`Did not find person for ${name}`);
      continue;
    }
    const contactMethod = await db
      .select()
      .from(contactMethods)
      .where(eq(contactMethods.personId, person[0].id))
      .execute();
    if (contactMethod.length === 0) {
      console.log(`Did not find contact method for ${name}`);
      continue;
    }

    console.log(`Creating slack metadata for ${name}`);
    await db.insert(slackMetadata).values({
      contactMethodId: contactMethod[0].id,
      channelId: 'C0D9VG7M4', // random
      slackUserId: slackId,
    });
  }
}

main();
