import { z } from "zod";
import { getPaginatedCommunicationsQuerySchema } from "birthday-bot-contracts";

import { CommunicationRepository } from "../ports/output/communication.repository";
import { CommunicationUseCase } from "../ports/input/communication.use-case";
import { PersonRepository } from "../ports/output/person.repository";
import { ContactMethodRepository } from "../ports/output/contact-method.repository";

export class CommunicationService implements CommunicationUseCase {
  constructor(
    private readonly communicationRepository: CommunicationRepository,
    private readonly personRepository: PersonRepository,
    private readonly contactMethodRepository: ContactMethodRepository
  ) {}

  async getPaginatedCommunications(query: z.infer<typeof getPaginatedCommunicationsQuerySchema>) {
    const communications = await this.communicationRepository.getPaginated(query);
    const people = await this.personRepository.getByIds(communications.map((communication) => communication.personId));
    const peopleMap = new Map(people.map((person) => [person.id, person]));
    const contactMethods = await this.contactMethodRepository.getByIds(communications.map((communication) => communication.contactMethodId));
    const contactMethodsMap = new Map(contactMethods.map((contactMethod) => [contactMethod.id, contactMethod]));
    const count = await this.communicationRepository.count();
    return {
      communications: communications.map((communication) => ({
        ...communication,
        personName: peopleMap.get(communication.personId)?.name,
        applicationName: contactMethodsMap.get(communication.contactMethodId)?.applicationName,
      })),
      count,
    };
  }
}