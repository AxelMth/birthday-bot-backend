import { relations } from 'drizzle-orm';
import { date, integer, pgTable, varchar, pgEnum, unique } from 'drizzle-orm/pg-core';

// Enums
export const contactMethodApplicationEnum = pgEnum('contact_method_application', [
  'slack',
  'email',
  'phone',
  'sms',
  'whatsapp',
  'telegram',
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
  birthDate: date()
});

export const contactMethods = pgTable('contact_methods', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  applicationName: contactMethodApplicationEnum().notNull().unique(),
});

export const peopleContactMethods = pgTable('people_contact_methods', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  personId: integer()
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
  contactMethodId: integer()
    .notNull()
    .references(() => contactMethods.id, { onDelete: 'cascade' }),
  slackMetadataId: integer()
    .references(() => slackMetadata.id, { onDelete: 'cascade' }),
}, (table) => ({
  uniquePersonContactMethod: unique().on(table.personId, table.contactMethodId),
}));

export const slackMetadata = pgTable('slack_metadata', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
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
export const peopleRelations = relations(people, ({ many, one }) => ({
  contactMethods: one(peopleContactMethods),
  groups: many(peopleGroups),
}));

export const groupRelations = relations(groups, ({ many }) => ({
  people: many(peopleGroups),
}));

export const peopleContactMethodRelations = relations(peopleContactMethods, ({ one }) => ({
  person: one(people),
  contactMethod: one(contactMethods),
  slackMetadata: one(slackMetadata),
}));
