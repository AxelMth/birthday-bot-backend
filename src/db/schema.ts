import { relations } from "drizzle-orm";
import {
  date,
  integer,
  jsonb,
  pgTable,
  varchar,
  pgEnum,
  unique,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Enums
export const contactMethodApplicationEnum = pgEnum(
  "contact_method_application",
  ["slack", "email", "phone", "sms", "whatsapp", "telegram"],
);

// Tables (ordered to avoid forward references)
export const groups = pgTable("groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const slackMetadata = pgTable("slack_metadata", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  channelId: varchar({ length: 255 }).notNull(),
  slackUserId: varchar({ length: 255 }).notNull(),
});

export const contactMethods = pgTable("contact_methods", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  applicationName: contactMethodApplicationEnum().notNull().unique(),
});

export const people = pgTable("people", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  birthDate: date(),
  groupId: integer().references(() => groups.id, { onDelete: "set null" }),
});

export const peopleContactMethods = pgTable(
  "people_contact_methods",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    personId: integer()
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    contactMethodId: integer()
      .notNull()
      .references(() => contactMethods.id, { onDelete: "cascade" }),
    slackMetadataId: integer().references(() => slackMetadata.id, {
      onDelete: "cascade",
    }),
  },
  (table) => ({
    uniquePersonContactMethod: unique().on(
      table.personId,
      table.contactMethodId,
    ),
  }),
);

export const groupConnectors = pgTable(
  "group_connectors",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    groupId: integer()
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    integrationType: contactMethodApplicationEnum().notNull(),
    config: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    uniqueGroupIntegration: unique().on(table.groupId, table.integrationType),
  }),
);

export const adminUsers = pgTable("admin_users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
});

export const communications = pgTable("communications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  personId: integer()
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  contactMethodId: integer()
    .notNull()
    .references(() => contactMethods.id, { onDelete: "cascade" }),
  message: text().notNull(),
  sentAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const peopleRelations = relations(people, ({ many, one }) => ({
  contactMethod: one(peopleContactMethods),
  group: one(groups, {
    fields: [people.groupId],
    references: [groups.id],
  }),
  communications: many(communications),
}));

export const groupRelations = relations(groups, ({ many }) => ({
  people: many(people),
  connectors: many(groupConnectors),
}));

export const groupConnectorRelations = relations(
  groupConnectors,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupConnectors.groupId],
      references: [groups.id],
    }),
  }),
);

export const peopleContactMethodRelations = relations(
  peopleContactMethods,
  ({ one }) => ({
    person: one(people),
    contactMethod: one(contactMethods),
    slackMetadata: one(slackMetadata),
  }),
);

export const communicationRelations = relations(
  communications,
  ({ one }) => ({
    person: one(people),
    contactMethod: one(contactMethods),
  }),
);
