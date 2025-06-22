import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/message.repository';
import { ContactMethodRepository } from '../ports/output/contact-method.repository';
import { PersonRepository } from '../ports/output/person.repository';
import { Application } from '../../domain/value-objects/application';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';
import { Person } from '../../domain/entities/person';

export class BirthdayService implements BirthdayUseCase {
  constructor(
    private readonly messageRepositoriesByApplication: Record<
      Application,
      BirthdayMessageRepository
    >,
    private readonly personRepository: PersonRepository,
    private readonly contactMethodRepository: ContactMethodRepository
  ) {}

  async getNextBirthdaysUntil(date: Date): Promise<Person[]> {
    return this.personRepository.getPeopleByBirthdayRange(new Date(), date);
  }

  async sendTodayBirthdayMessages(): Promise<{
    birthdayMessageCount: number;
    people?: Person[];
  }> {
    const people = await this.personRepository.getPeopleByBirthday(new Date());
    if (people.length === 0) {
      return {
        birthdayMessageCount: 0,
      };
    }
    let birthdayMessageCount = 0;
    for (const person of people) {
      const contactMethod = await this.contactMethodRepository.getByPersonId(
        person.id
      );
      if (!contactMethod) {
        console.error(`No contact method found for person ${person.id}`);
        continue;
      }
      const messageRepository =
        this.messageRepositoriesByApplication[contactMethod.application];
      const metadataRepository = MetadataRepositoryFactory.getRepository(
        contactMethod.application
      );

      const metadata = await metadataRepository.getMetadataForContactMethod(
        contactMethod.id
      );
      await messageRepository.sendMessage('Joyeux anniversaire ', metadata);
      birthdayMessageCount++;
    }
    return {
      birthdayMessageCount,
      people,
    };
  }
}
