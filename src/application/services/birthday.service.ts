import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/message.repository';
import { ContactMethodRepository } from '../ports/output/contact-method.repository';
import { PersonRepository } from '../ports/output/person.repository';
import { Application } from '../../domain/value-objects/application';
import { MetadataRepositoryFactory } from '../../infrastructure/factories/metadata-repository.factory';
import { Person } from '../../domain/entities/person';
import { PersonContactMethodRepository } from '../ports/output/person-contact-method.repository';

export class BirthdayService implements BirthdayUseCase {
  private readonly birthdayMessages = [
    'Joyeux anniversaire ! 🎉',
    'Bon anniversaire ! 🎂',
    'Félicitations pour ton anniversaire ! 🥳',
    'Que cette nouvelle année t\'apporte bonheur et réussite ! 🌟',
    'Un très joyeux anniversaire ! 🎈',
    'Bonne fête ! Profite bien de ta journée spéciale ! 🎊',
    'Anniversaire magique ! ✨🎂',
    'Souhaits de bonheur pour ton anniversaire ! 💫',
    'Une merveilleuse journée d\'anniversaire ! 🌈',
    'Que cette nouvelle année t\'apporte bonheur et réussite ! 🌟',
    'Un très joyeux anniversaire ! 🎈',
    'Bonne fête ! Profite bien de ta journée spéciale ! 🎊',
    'Anniversaire magique ! ✨🎂',
    'Souhaits de bonheur pour ton anniversaire ! 💫',
    'Une merveilleuse journée d\'anniversaire ! 🌈',
  ];

  constructor(
    private readonly messageRepositoriesByApplication: Record<
      Application,
      BirthdayMessageRepository
    >,
    private readonly personRepository: PersonRepository,
    private readonly personContactMethodRepository: PersonContactMethodRepository
  ) {}

  private getRandomBirthdayMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.birthdayMessages.length);
    return this.birthdayMessages[randomIndex];
  }

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
      const {contactMethod, contactMethodMetadata} = await this.personContactMethodRepository.getByPersonId(
        person.id
      );
      if (!contactMethod) {
        console.error(`No contact method found for person ${person.id}`);
        continue;
      }
      const messageRepository =
        this.messageRepositoriesByApplication[contactMethod.applicationName];
      const metadataRepository = MetadataRepositoryFactory.getRepository(
        contactMethod.applicationName
      );

      const randomMessage = this.getRandomBirthdayMessage();
      await messageRepository.sendMessage(randomMessage, contactMethodMetadata);
      birthdayMessageCount++;
    }
    return {
      birthdayMessageCount,
      people,
    };
  }
}
