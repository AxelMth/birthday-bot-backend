import { initServer } from "@ts-rest/fastify";
import { birthdayContract } from "birthday-bot-contracts";

import { DatabasePersonRepository } from "../../infrastructure/repositories/database-person.repository";
import { SlackBirthdayMessageRepository } from "../../infrastructure/repositories/slack-birthday-message.repository";
import { BirthdayService } from "../../application/services/birthday.service";
import { DatabaseContactMethodRepository } from "../../infrastructure/repositories/database-contact-method.repository";
import { DatabaseCommunicationRepository } from "../../infrastructure/repositories/database-communication.repository";
import { Application } from "../../domain/value-objects/application";

const s = initServer();

const databasePersonRepository = new DatabasePersonRepository();

const messageRepositoriesByApplication = {
  slack: new SlackBirthdayMessageRepository(),
};

const databaseContactMethodRepository = new DatabaseContactMethodRepository();
const databaseCommunicationRepository = new DatabaseCommunicationRepository();

const birthdayService = new BirthdayService(
  messageRepositoriesByApplication,
  databasePersonRepository,
  databaseContactMethodRepository,
  databaseCommunicationRepository,
);


// Factorize to a shared function
function toPersonDTO(person: any) {
  let application: string | undefined;
  let applicationMetadata: Record<string, string> | undefined;

  if (person.preferredContact) {
    switch (person.preferredContact.kind) {
      case Application.Slack:
        application = Application.Slack;
        applicationMetadata = {
          channelId: person.preferredContact.info.channelId,
          userId: person.preferredContact.info.userId,
        };
        break;
    }
  }

  return {
    id: person.id,
    name: person.name,
    birthDate: person.birthDate?.toISOString().split("T")[0],
    application,
    applicationMetadata,
  };
}

export const birthdayRouter = s.router(birthdayContract, {
  sendTodayBirthdayMessages: async () => {
    const { birthdayMessageCount } =
      await birthdayService.sendTodayBirthdayMessages();
    return {
      status: 200,
      body: {
        message:
          birthdayMessageCount === 0
            ? "No birthday today"
            : `${birthdayMessageCount} birthday message${
                birthdayMessageCount > 1 ? "s" : ""
              } sent successfully`,
      },
    };
  },
  getNextBirthdays: async ({ query }) => {
    const date = new Date(query.date as string);
    const people = await birthdayService.getNextBirthdaysUntil(date);
    return {
      status: 200,
      body: {
        people: people.map(toPersonDTO),
      },
    };
  },
});
