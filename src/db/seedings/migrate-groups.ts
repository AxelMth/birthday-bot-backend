import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

import { groups, people, groupConnectors, adminUsers } from "../schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("Starting migration: multi-group support...");

  // 1. Create "Citron" group
  const [citronGroup] = await db
    .insert(groups)
    .values({ name: "Citron" })
    .onConflictDoNothing({ target: groups.name })
    .returning();

  const citronId =
    citronGroup?.id ??
    (await db.select().from(groups).where(eq(groups.name, "Citron")))[0].id;

  console.log(`Group "Citron" created/found with id ${citronId}`);

  // 2. Assign all existing people to "Citron" group
  await db
    .update(people)
    .set({ groupId: citronId } as any)
    .where(sql`${people.groupId} IS NULL`);

  console.log(`Assigned existing people to "Citron" group`);

  // 3. Create connector for Citron using existing SLACK_USER_OAUTH_TOKEN
  const slackToken = process.env.SLACK_USER_OAUTH_TOKEN || process.env.SLACK_BOT_USER_OAUTH_TOKEN;
  if (slackToken) {
    await db
      .insert(groupConnectors)
      .values({
        groupId: citronId,
        integrationType: "slack",
        config: { botToken: slackToken },
      } as any)
      .onConflictDoNothing();
    console.log(`Slack connector configured for "Citron"`);
  } else {
    console.warn("No SLACK_USER_OAUTH_TOKEN or SLACK_BOT_USER_OAUTH_TOKEN found, skipping connector setup");
  }

  // 4. Create admin user
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db
      .insert(adminUsers)
      .values({ username: adminUsername, passwordHash })
      .onConflictDoNothing({ target: adminUsers.username });
    console.log(`Admin user "${adminUsername}" created`);
  } else {
    console.warn("No ADMIN_PASSWORD env var set, skipping admin user creation");
  }

  console.log("Migration complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
