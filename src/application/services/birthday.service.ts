import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/message.repository';
import { PersonRepository } from '../ports/output/person.repository';
import { Application } from '../../domain/value-objects/application';
import { Person } from '../../domain/entities/person';

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
    private readonly personRepository: PersonRepository
  ) {}

  private getRandomBirthdayMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.birthdayMessages.length);
    return this.birthdayMessages[randomIndex];
  }

  async getNextBirthdaysUntil(date: Date): Promise<Person[]> {
    return this.personRepository.getByBirthdayRange(new Date(), date);
  }

  async sendTodayBirthdayMessages(): Promise<{
    birthdayMessageCount: number;
    people?: Person[];
  }> {
    const people = await this.personRepository.getByBirthday(new Date());
    if (people.length === 0) {
      return {
        birthdayMessageCount: 0,
      };
    }
    let birthdayMessageCount = 0;
    for (const person of people) {
      if (!person.preferredContact) {
        console.error(`No contact method found for person ${person.id}`);
        continue;
      }
      
      const messageRepository = this.messageRepositoriesByApplication[person.preferredContact.kind];
      if (!messageRepository) {
        console.error(`No message repository found for application ${person.preferredContact.kind}`);
        continue;
      }

      const randomMessage = this.getRandomBirthdayMessage();
      
      // Convert ContactChannel to the format expected by the message repository
      if (person.preferredContact.kind === Application.Slack) {
        const slackMetadata = {
          id: 0, // Not used by message repository
          channelId: person.preferredContact.info.channelId,
          userId: person.preferredContact.info.userId,
        };
        await messageRepository.sendMessage(randomMessage, slackMetadata);
        birthdayMessageCount++;
      }
    }
    return {
      birthdayMessageCount,
      people,
    };
  }
}
