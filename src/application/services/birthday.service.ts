import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/message.repository';
import { PersonRepository } from '../ports/output/person.repository';
import { Application } from '../../domain/value-objects/application';
import { Person } from '../../domain/entities/person';

export class BirthdayService implements BirthdayUseCase {
  private readonly birthdayMessages = [
    'Joyeux {age}ᵉ anniversaire {name} ! 🎉 J\'espère que ta journée sera aussi géniale que toi.',
    'Bon anniversaire {name} ! 🎂 Déjà {age} ans, ça se fête en grand 🎊',
    'Félicitations pour tes {age} ans {name} ! 🥳 Que cette nouvelle année de vie t\'apporte plein de belles surprises.',
    '{name}, je te souhaite un superbe anniversaire pour tes {age} ans ! 🌟',
    'Un très joyeux {age}ᵉ anniversaire {name} ! 🎈 Profite de chaque instant.',
    'Souhaits de bonheur et de réussite pour tes {age} ans {name} ! 💫',
    'Une merveilleuse journée d\'anniversaire à toi {name} qui fêtes tes {age} ans aujourd\'hui ! 🌈',
    '{name}, joyeux anniversaire pour tes {age} ans ! Que cette nouvelle année soit pleine de rires et de beaux souvenirs ✨',
    '{name}, {age} ans déjà ! 🎂 Que cette journée spéciale soit à ton image : unique et inoubliable.',
    'Bonne fête {name} ! 🎊 Profite à fond de tes {age} ans, ça ne revient qu\'une fois 😉',
    'Un anniversaire magique pour tes {age} ans {name} ! ✨🎂',
    'Santé, bonheur et réussite pour tes {age} ans {name} ! 🥂',
    '{name}, joyeux {age}ᵉ anniversaire ! 🌟 Merci d\'être la personne géniale que tu es.',
    'Que tes {age} ans soient remplis de joie, d\'amour et de belles surprises {name} ! 🎁',
    'Joyeux anniversaire {name} ! 🎉 {age} ans, c\'est une étape à célébrer comme il se doit 🚀',
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

  private formatMessage(message: string, person: Person): string {
    if (!person.birthDate) {
      return message.replace(/{name}/g, person.name).replace(/{age}/g, '?');
    }

    const today = new Date();
    const age = today.getFullYear() - person.birthDate.getFullYear();
    
    // For Slack messages, let the Slack repository handle {name} replacement
    if (person.preferredContact?.kind === Application.Slack) {
      return message.replace(/{age}/g, age.toString());
    }
    
    return message
      .replace(/{name}/g, person.name)
      .replace(/{age}/g, age.toString());
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
      const formattedMessage = this.formatMessage(randomMessage, person);
      
      if (person.preferredContact.kind === Application.Slack) {
        const slackMetadata = {
          id: 0,
          channelId: person.preferredContact.info.channelId,
          userId: person.preferredContact.info.userId,
        };
        await messageRepository.sendMessage(formattedMessage, slackMetadata);
        birthdayMessageCount++;
      }
    }
    return {
      birthdayMessageCount,
      people,
    };
  }
}
