import { relations } from 'drizzle-orm';
import { date, integer, pgTable, varchar, pgEnum } from 'drizzle-orm/pg-core';

// Define enum for communication applications
export const communicationAppEnum = pgEnum('communication_app', [
  "slack",
]);

// Define enum for group types
export const groupTypeEnum = pgEnum('group_type', [
  'family',
  'work',
  'friends',
  'other',
]);

// Users table
export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  birthDate: date().notNull(),
});

// Communications table (preferred contact method)
export const communications = pgTable('communications', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  application: communicationAppEnum().notNull()
});

// Groups table
export const groups = pgTable('groups', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  type: groupTypeEnum().notNull().default('other'),
});

// Many-to-Many Relationship: User-Groups
export const userGroups = pgTable('user_groups', {
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: integer().notNull().references(() => groups.id, { onDelete: 'cascade' }),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  communications: many(communications),
  groups: many(userGroups),
}));

export const groupRelations = relations(groups, ({ many }) => ({
  users: many(userGroups),
}));