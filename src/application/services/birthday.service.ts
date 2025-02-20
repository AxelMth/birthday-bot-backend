import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/message.repository';
import { CommunicationRepository } from '../ports/output/communication.repository';
import { PersonRepository } from '../ports/output/person.repository';
import { Application } from '@/domain/value-objects/application';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';
import { Person } from '@/domain/entities/person';

export class BirthdayService implements BirthdayUseCase {
  constructor(
    private readonly messageRepositoriesByApplication: Record<
      Application,
      BirthdayMessageRepository
    >,
    private readonly personRepository: PersonRepository,
    private readonly communicationRepository: CommunicationRepository
  ) {}

  async getNextBirthdaysUntil(date: Date): Promise<Person[]> {
    return this.personRepository.getPeopleByBirthdayRange(new Date(), date);
  }

  async sendTodayBirthdayMessages(): Promise<void> {
    const people = await this.personRepository.getPeopleByBirthday(new Date());
    if (people.length === 0) {
      console.log('No birthdays today');
      return;
    }
    for (const person of people) {
      const communications = await this.communicationRepository.getByPersonId(
        person.id
      );
      for (const communication of communications) {
        const messageRepository =
          this.messageRepositoriesByApplication[communication.application];
        const metadataRepository = MetadataRepositoryFactory.getRepository(
          communication.application
        );

        const metadata = await metadataRepository.getMetadataForCommunication(
          communication.id
        );
        await messageRepository.sendMessage('Joyeux anniversaire ', metadata);
      }
    }
  }
}
