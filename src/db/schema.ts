import { relations } from 'drizzle-orm';
import { date, integer, pgTable, varchar, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const contactMethodAppEnum = pgEnum('contact_method_app', [
  'slack',
  'email',
]);

export const groupTypeEnum = pgEnum('group_type', [
  'family',
  'work',
  'friends',
  'other',
]);

// Tables
export const people = pgTable('people', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  birthDate: date().notNull(),
});

export const contactMethods = pgTable('contact_methods', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  personId: integer()
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
  application: contactMethodAppEnum().notNull(),
});

export const slackMetadata = pgTable('slack_metadata', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  contactMethodId: integer()
    .notNull()
    .references(() => contactMethods.id, {
      onDelete: 'cascade',
    }),
  channelId: varchar({ length: 255 }).notNull(),
  slackUserId: varchar({ length: 255 }).notNull(),
});

export const groups = pgTable('groups', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  type: groupTypeEnum().notNull().default('other'),
});

export const peopleGroups = pgTable('people_groups', {
  personId: integer()
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
  groupId: integer()
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
});

// Relations
export const peopleRelations = relations(people, ({ many }) => ({
  communications: many(contactMethods),
  groups: many(peopleGroups),
}));

export const groupRelations = relations(groups, ({ many }) => ({
  people: many(peopleGroups),
}));

export const communicationRelations = relations(contactMethods, ({ one }) => ({
  slackMetadata: one(slackMetadata),
}));
