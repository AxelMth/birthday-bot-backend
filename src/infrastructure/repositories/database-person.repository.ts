import { sql, count, eq, and, inArray, asc, desc } from "drizzle-orm";

import { PersonRepository } from "../../application/ports/output/person.repository";
import { db } from "../../db";
import {
  people,
  contactMethods,
  peopleContactMethods,
  slackMetadata,
} from "../../db/schema";
import { Person } from "../../domain/entities/person";
import { Application } from "../../domain/value-objects/application";
import { ContactChannel } from "../../domain/value-objects/contact-info";

export class DatabasePersonRepository implements PersonRepository {
  private async hydratePersonWithContactChannel(
    personId: number,
  ): Promise<Person> {
    const [result] = await db
      .select({
        personId: people.id,
        personName: people.name,
        personBirthDate: people.birthDate,
        applicationName: contactMethods.applicationName,
        channelId: slackMetadata.channelId,
        slackUserId: slackMetadata.slackUserId,
      })
      .from(people)
      .leftJoin(
        peopleContactMethods,
        eq(people.id, peopleContactMethods.personId),
      )
      .leftJoin(
        contactMethods,
        eq(peopleContactMethods.contactMethodId, contactMethods.id),
      )
      .leftJoin(
        slackMetadata,
        eq(peopleContactMethods.slackMetadataId, slackMetadata.id),
      )
      .where(eq(people.id, personId));

    if (!result) {
      throw new Error(`Person with id ${personId} not found`);
    }

    const birthDate = result.personBirthDate
      ? new Date(result.personBirthDate + "T00:00:00.000Z")
      : undefined;

    let preferredContact: ContactChannel | undefined;
    if (
      result.applicationName === Application.Slack &&
      result.channelId &&
      result.slackUserId
    ) {
      preferredContact = {
        kind: Application.Slack,
        info: {
          channelId: result.channelId,
          userId: result.slackUserId,
        },
      };
    }

    const person = new Person(result.personId, result.personName, birthDate);
    person.setPreferredContact(preferredContact);
    return person;
  }

  private async hydrateMultiplePersonsWithContactChannels(
    personIds: number[],
  ): Promise<Person[]> {
    if (personIds.length === 0) return [];

    const results = await db
      .select({
        personId: people.id,
        personName: people.name,
        personBirthDate: people.birthDate,
        applicationName: contactMethods.applicationName,
        channelId: slackMetadata.channelId,
        slackUserId: slackMetadata.slackUserId,
      })
      .from(people)
      .leftJoin(
        peopleContactMethods,
        eq(people.id, peopleContactMethods.personId),
      )
      .leftJoin(
        contactMethods,
        eq(peopleContactMethods.contactMethodId, contactMethods.id),
      )
      .leftJoin(
        slackMetadata,
        eq(peopleContactMethods.slackMetadataId, slackMetadata.id),
      )
      .where(inArray(people.id, personIds));

    const personsMap = new Map<number, Person>();

    for (const result of results) {
      const birthDate = result.personBirthDate
        ? new Date(result.personBirthDate + "T00:00:00.000Z")
        : undefined;

      let preferredContact: ContactChannel | undefined;
      if (
        result.applicationName === Application.Slack &&
        result.channelId &&
        result.slackUserId
      ) {
        preferredContact = {
          kind: Application.Slack,
          info: {
            channelId: result.channelId,
            userId: result.slackUserId,
          },
        };
      }

      const person = new Person(result.personId, result.personName, birthDate);
      person.setPreferredContact(preferredContact);
      personsMap.set(result.personId, person);
    }

    // Return in original order
    return personIds.map((id) => personsMap.get(id)!).filter(Boolean);
  }

  async getById(id: number): Promise<Person> {
    return await this.hydratePersonWithContactChannel(id);
  }

  async getPaginated(params: {
    search?: string;
    limit: number;
    offset: number;
    sort?: "birthDate" | "name";
    order?: "asc" | "desc";
  }): Promise<Person[]> {
    const sortBy = params.sort === "birthDate" ? people.birthDate : people.name;
    const orderBy = params.order === "asc" ? asc(sortBy) : desc(sortBy);
    const peopleRows = await db
      .select({ id: people.id })
      .from(people)
      .where(
        params.search ? sql`name ILIKE ${`%${params.search}%`}` : undefined,
      )
      .orderBy(orderBy)
      .limit(params.limit)
      .offset(params.offset);

    const personIds = peopleRows.map((row) => row.id);
    return await this.hydrateMultiplePersonsWithContactChannels(personIds);
  }

  async count(params: { search?: string }): Promise<number> {
    const [{ count: counter }] = await db
      .select({ count: count() })
      .from(people)
      .where(
        params.search ? sql`name ILIKE ${`%${params.search}%`}` : undefined,
      );
    return counter;
  }

  async getByBirthday(date: Date): Promise<Person[]> {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const peopleRows = await db
      .select({ id: people.id })
      .from(people)
      .where(
        sql`date_part('day', "birthDate") = ${day} and date_part('month', "birthDate") = ${month}`,
      );

    const personIds = peopleRows.map((row) => row.id);
    return await this.hydrateMultiplePersonsWithContactChannels(personIds);
  }

  async getByBirthdayRange(start: Date, end: Date): Promise<Person[]> {
    const startDay = start.getDate();
    const startMonth = start.getMonth() + 1;
    const endDay = end.getDate();
    const endMonth = end.getMonth() + 1;
    const peopleRows = await db
      .select({ id: people.id })
      .from(people)
      .where(
        sql`date_part('day', "birthDate") >= ${startDay} and date_part('month', "birthDate") >= ${startMonth} and date_part('day', "birthDate") <= ${endDay} and date_part('month', "birthDate") <= ${endMonth}`,
      );

    const personIds = peopleRows.map((row) => row.id);
    return await this.hydrateMultiplePersonsWithContactChannels(personIds);
  }

  async save(person: Person): Promise<void> {
    await db.transaction(async (tx) => {
      // Update person profile
      const updateData: any = {
        name: person.name,
      };
      if (person.birthDate !== undefined) {
        updateData.birthDate = person.birthDate
          ? person.birthDate.toISOString().split("T")[0]
          : null;
      }
      await tx.update(people).set(updateData).where(eq(people.id, person.id));

      // Handle preferred contact
      if (person.preferredContact) {
        await this.upsertContactChannel(tx, person.id, person.preferredContact);
      } else {
        // Remove any existing contact method
        await tx
          .delete(peopleContactMethods)
          .where(eq(peopleContactMethods.personId, person.id));
      }
    });
  }

  async create(person: Person): Promise<Person> {
    return await db.transaction(async (tx) => {
      // Create person
      const insertData: any = {
        name: person.name,
      };
      if (person.birthDate !== undefined) {
        insertData.birthDate = person.birthDate
          ? person.birthDate.toISOString().split("T")[0]
          : null;
      }
      const [createdPerson] = await tx
        .insert(people)
        .values(insertData)
        .returning({ id: people.id });

      const newPerson = new Person(
        createdPerson.id,
        person.name,
        person.birthDate,
      );

      // Handle preferred contact
      if (person.preferredContact) {
        await this.upsertContactChannel(
          tx,
          createdPerson.id,
          person.preferredContact,
        );
        newPerson.setPreferredContact(person.preferredContact);
      }

      return newPerson;
    });
  }

  async delete(id: number): Promise<void> {
    await db.delete(people).where(eq(people.id, id));
  }

  private async upsertContactChannel(
    tx: any,
    personId: number,
    contactChannel: ContactChannel,
  ): Promise<void> {
    if (contactChannel.kind === Application.Slack) {
      // Get or create contact method id
      const [contactMethodRow] = await tx
        .select({ id: contactMethods.id })
        .from(contactMethods)
        .where(eq(contactMethods.applicationName, Application.Slack));

      if (!contactMethodRow) {
        throw new Error("Slack contact method not found in database");
      }

      // Upsert slack metadata
      const [slackMetadataRow] = await tx
        .insert(slackMetadata)
        .values({
          channelId: contactChannel.info.channelId,
          slackUserId: contactChannel.info.userId,
        })
        .onConflictDoNothing()
        .returning({ id: slackMetadata.id });

      let metadataId = slackMetadataRow?.id;

      if (!metadataId) {
        // Find existing metadata
        const [existing] = await tx
          .select({ id: slackMetadata.id })
          .from(slackMetadata)
          .where(
            and(
              eq(slackMetadata.channelId, contactChannel.info.channelId),
              eq(slackMetadata.slackUserId, contactChannel.info.userId),
            ),
          );
        metadataId = existing?.id;
      }

      if (!metadataId) {
        throw new Error("Failed to create or find slack metadata");
      }

      // Upsert people_contact_methods
      await tx
        .insert(peopleContactMethods)
        .values({
          personId,
          contactMethodId: contactMethodRow.id,
          slackMetadataId: metadataId,
        })
        .onConflictDoUpdate({
          target: [
            peopleContactMethods.personId,
            peopleContactMethods.contactMethodId,
          ],
          set: {
            slackMetadataId: metadataId,
          },
        });
    }
  }
}
