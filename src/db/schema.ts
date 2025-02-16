import { date, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  birthDate: varchar({ length: 10 }).notNull(),
  birthDateAsDate: date().notNull().default('now()'),
});
