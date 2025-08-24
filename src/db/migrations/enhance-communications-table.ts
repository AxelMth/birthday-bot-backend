import { sql } from "drizzle-orm";
import { pgTable, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Create the enums
export const communicationStatusEnum = pgEnum("communication_status", [
  "pending",
  "sent", 
  "failed",
  "delivered",
]);

export const communicationTypeEnum = pgEnum("communication_type", [
  "birthday_message",
  "reminder", 
  "notification",
  "other",
]);

// Migration function
export async function up(db: any) {
  // Create enums
  await db.execute(sql`
    CREATE TYPE communication_status AS ENUM ('pending', 'sent', 'failed', 'delivered');
  `);
  
  await db.execute(sql`
    CREATE TYPE communication_type AS ENUM ('birthday_message', 'reminder', 'notification', 'other');
  `);

  // Add new columns to communications table
  await db.execute(sql`
    ALTER TABLE communications 
    ADD COLUMN id SERIAL PRIMARY KEY,
    ADD COLUMN type communication_type NOT NULL DEFAULT 'other',
    ADD COLUMN status communication_status NOT NULL DEFAULT 'pending',
    ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ADD COLUMN error_message TEXT;
  `);
}

export async function down(db: any) {
  // Remove columns
  await db.execute(sql`
    ALTER TABLE communications
    DROP COLUMN id,
    DROP COLUMN type,
    DROP COLUMN status,
    DROP COLUMN sent_at,
    DROP COLUMN created_at,
    DROP COLUMN error_message;
  `);

  // Drop enums
  await db.execute(sql`DROP TYPE communication_status;`);
  await db.execute(sql`DROP TYPE communication_type;`);
}
