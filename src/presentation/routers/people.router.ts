import { initServer } from "@ts-rest/fastify";
import { peopleContract } from "birthday-bot-contracts";

import { DatabasePersonRepository } from "../../infrastructure/repositories/database-person.repository";
import { PeopleService } from "../../application/services/people.service";
import { Application } from "../../domain/value-objects/application";

const s = initServer();

const databasePersonRepository = new DatabasePersonRepository();
const peopleService = new PeopleService(databasePersonRepository);

// Helper function to convert domain to DTO
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

export const peopleRouter = s.router(peopleContract, {
  createPerson: async ({ body }) => {
    const person = await peopleService.createPerson(body);
    return {
      status: 200,
      body: toPersonDTO(person),
    };
  },
  updatePersonById: async ({ params, body }) => {
    const person = await peopleService.updatePersonById(params.id!, body);
    return {
      status: 200,
      body: toPersonDTO(person),
    };
  },
  getPersonById: async ({ params }) => {
    const person = await peopleService.getPersonById(params.id!);
    return {
      status: 200,
      body: toPersonDTO(person),
    };
  },
  getPaginatedPeople: async ({ query }) => {
    const { people, count } = await peopleService.getPaginatedPeople(query);
    return {
      status: 200,
      body: {
        people: people.map(toPersonDTO),
        count,
      },
    };
  },
  deletePersonById: async ({ params }) => {
    await peopleService.deletePersonById(params.id!);
    return {
      status: 200,
      body: {
        success: true,
      },
    };
  },
});
