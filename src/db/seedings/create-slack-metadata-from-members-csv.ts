import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, ilike } from 'drizzle-orm';
import fs from 'node:fs/promises';
import { contactMethods, people, slackMetadata } from '../schema';

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;

const db = drizzle(process.env.DATABASE_URL!);

function parseCsv(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(l => l.length > 0);
  const rows: string[][] = [];
  for (const line of lines) {
    const row: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else {
        field += ch;
      }
    }
    row.push(field);
    rows.push(row.map(v => v.trim()));
  }
  return rows;
}

async function main() {
  const csvPath =
    process.argv[2] ||
    '/Users/axelmathieulegall/Desktop/Citron® Member Analytics Prior 30 Days - Aug 10, 2025 (1).csv';

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL env var is required');
  }

  const content = await fs.readFile(csvPath, 'utf-8');
  const rows = parseCsv(content);
  if (rows.length === 0) {
    throw new Error('CSV appears empty');
  }

  const header = rows[0];
  const idxName = header.indexOf('Name');
  const idxUserId = header.indexOf('User ID');
  const idxDeactivated = header.indexOf('Deactivated date (UTC)');

  if (idxName < 0 || idxUserId < 0 || idxDeactivated < 0) {
    throw new Error('CSV header must contain "Name", "User ID", "Deactivated date (UTC)"');
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let usersCreated = 0;

  for (const row of rows.slice(1)) {
    const name = row[idxName];
    const slackId = row[idxUserId];
    const deactivated = row[idxDeactivated];

    if (!name || !slackId || (deactivated && deactivated.length > 0)) {
      skipped++;
      continue;
    }

    let person = await db
      .select()
      .from(people)
      .where(ilike(people.name, name))
      .execute();

    // Create user if not found
    if (person.length === 0) {
      console.log(`Creating new person for "${name}"`);
      const insertedPerson = await db
        .insert(people)
        .values({ 
          name,
        })
        .returning()
        .execute();
      person = insertedPerson;
      usersCreated++;
    }
    
    const personId = person[0].id;

    let cm = await db
      .select()
      .from(contactMethods)
      .where(eq(contactMethods.personId, personId))
      .execute();

    if (cm.length === 0) {
      const inserted = await db
        .insert(contactMethods)
        .values({ personId, application: 'slack' })
        .returning()
        .execute();
      cm = inserted;
    }

    const res = await db
      .insert(slackMetadata)
      .values({
        contactMethodId: cm[0].id,
        webhookUrl: WEBHOOK_URL,
        slackUserId: slackId,
      })
      .onConflictDoUpdate({
        target: [slackMetadata.contactMethodId],
        set: { webhookUrl: WEBHOOK_URL, slackUserId: slackId },
      })
      .returning()
      .execute();

    if (res.length > 0) {
      // If we updated existing row, treat as updated; otherwise created
      // This is a simple heuristic: if there was already a row it counts as updated.
      updated++; // counting all as updated to keep output simple
    } else {
      created++;
    }
  }

  console.log(`Done. Created/updated: ${created + updated}, skipped: ${skipped}, users created: ${usersCreated}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});