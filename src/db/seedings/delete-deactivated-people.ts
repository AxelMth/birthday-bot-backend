import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, ilike } from "drizzle-orm";
import fs from "node:fs/promises";
import { people } from "../schema";

const db = drizzle(process.env.DATABASE_URL!);

function parseCsv(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  const rows: string[][] = [];
  for (const line of lines) {
    const row: string[] = [];
    let field = "";
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
      } else if (ch === "," && !inQuotes) {
        row.push(field);
        field = "";
      } else {
        field += ch;
      }
    }
    row.push(field);
    rows.push(row.map((v) => v.trim()));
  }
  return rows;
}

async function main() {
  const csvPath =
    process.argv[2] ||
    "/Users/axelmathieulegall/Desktop/Citron® Member Analytics Prior 30 Days - Aug 10, 2025 (1).csv";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL env var is required");
  }

  const content = await fs.readFile(csvPath, "utf-8");
  const rows = parseCsv(content);
  if (rows.length === 0) {
    throw new Error("CSV appears empty");
  }

  const header = rows[0];
  const idxName = header.indexOf("Name");
  const idxUserId = header.indexOf("User ID");
  const idxDeactivated = header.indexOf("Deactivated date (UTC)");

  if (idxName < 0 || idxUserId < 0 || idxDeactivated < 0) {
    throw new Error(
      'CSV header must contain "Name", "User ID", "Deactivated date (UTC)"',
    );
  }

  let deleted = 0;
  let notFound = 0;
  let processed = 0;

  console.log("Starting deletion of deactivated users...");

  for (const row of rows.slice(1)) {
    const name = row[idxName];
    const slackId = row[idxUserId];
    const deactivated = row[idxDeactivated];

    // Only process rows that have a deactivation date
    if (!name || !deactivated || deactivated.length === 0) {
      continue;
    }

    processed++;
    console.log(
      `Processing deactivated user: "${name}" (deactivated: ${deactivated})`,
    );

    // Find the person in the database
    const person = await db
      .select()
      .from(people)
      .where(ilike(people.name, name))
      .execute();

    if (person.length === 0) {
      console.log(`  Person "${name}" not found in database`);
      notFound++;
      continue;
    }

    // Delete the person (cascade will handle related records)
    const deleteResult = await db
      .delete(people)
      .where(eq(people.id, person[0].id))
      .execute();

    console.log(`  Deleted person "${name}" (ID: ${person[0].id})`);
    deleted++;
  }

  console.log("\n=== Deletion Summary ===");
  console.log(`Processed deactivated users: ${processed}`);
  console.log(`Successfully deleted: ${deleted}`);
  console.log(`Not found in database: ${notFound}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error during deletion:", err);
  process.exit(1);
});
