import { BirthdayUseCase } from "../ports/input/birthday.use-case";
import { BirthdayMessageRepository } from "../ports/output/message.repository";
import { PersonRepository } from "../ports/output/person.repository";
import { CommunicationRepository } from "../ports/output/communication.repository";
import { Application } from "../../domain/value-objects/application";
import { Person } from "../../domain/entities/person";
import { ContactMethodRepository } from "../ports/output/contact-method.repository";

export class BirthdayService implements BirthdayUseCase {
  private readonly birthdayMessages = [
    "Joyeux anniversaire {name} ! 🎉 J'espère que ta journée sera aussi géniale que toi.",
    "Bon anniversaire {name} ! 🎂 Ça se fête en grand 🎊",
    "Félicitations {name} ! 🥳 Que cette nouvelle année de vie t'apporte plein de belles surprises.",
    "{name}, je te souhaite un superbe anniversaire ! 🌟",
    "Un très joyeux anniversaire {name} ! 🎈 Profite de chaque instant.",
    "Souhaits de bonheur et de réussite {name} ! 💫",
    "Une merveilleuse journée d'anniversaire à toi {name} ! 🌈",
    "{name}, joyeux anniversaire ! Que cette nouvelle année soit pleine de rires et de beaux souvenirs ✨",
    "{name}, c'est ton anniversaire ! 🎂 Que cette journée spéciale soit à ton image : unique et inoubliable.",
    "Bonne fête {name} ! 🎊 Profite à fond de ton anniversaire, ça ne revient qu'une fois par an 😉",
    "Un anniversaire magique {name} ! ✨🎂",
    "Santé, bonheur et réussite {name} ! 🥂",
    "{name}, joyeux anniversaire ! 🌟 Merci d'être la personne géniale que tu es.",
    "Que ton anniversaire soit rempli de joie, d'amour et de belles surprises {name} ! 🎁",
    "Joyeux anniversaire {name} ! 🎉 C'est une étape à célébrer comme il se doit 🚀",
  ];

  constructor(
    private readonly messageRepositoriesByApplication: Record<
      Application,
      BirthdayMessageRepository
    >,
    private readonly personRepository: PersonRepository,
    private readonly contactMethodRepository: ContactMethodRepository,
    private readonly communicationRepository: CommunicationRepository,
  ) {}

  private getRandomBirthdayMessage(): string {
    const randomIndex = Math.floor(
      Math.random() * this.birthdayMessages.length,
    );
    return this.birthdayMessages[randomIndex];
  }

  private formatMessage(message: string, person: Person): string {
    // For Slack messages, let the Slack repository handle {name} replacement
    if (person.preferredContact?.kind === Application.Slack) {
      return message;
    }

    return message.replace(/{name}/g, person.name);
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
      console.log("🎂 No birthdays today");
      return {
        birthdayMessageCount: 0,
      };
    }

    console.log(`🎉 Found ${people.length} birthday(s) today: ${people.map(p => p.name).join(', ')}`);
    
    let birthdayMessageCount = 0;

    for (const person of people) {
      if (!person.preferredContact) {
        const errorMsg = `No contact method found for person ${person.id}`;
        console.error(`❌ ${errorMsg}`);
        continue;
      }

      const messageRepository =
        this.messageRepositoriesByApplication[person.preferredContact.kind];
      if (!messageRepository) {
        const errorMsg = `No message repository found for application ${person.preferredContact.kind}`;
        console.error(`❌ ${errorMsg}`);
        continue;
      }

      const randomMessage = this.getRandomBirthdayMessage();
      const formattedMessage = this.formatMessage(randomMessage, person);

      const contactMethod = await this.contactMethodRepository.getByApplication(person.preferredContact.kind);

      if (person.preferredContact.kind === Application.Slack) {
        const slackMetadata = {
          id: 0,
          channelId: person.preferredContact.info.channelId,
          userId: person.preferredContact.info.userId,
        };
        
        console.log(`📤 Sending birthday message to ${person.name} via Slack...`);
        await messageRepository.sendMessage(formattedMessage, slackMetadata);
        await this.communicationRepository.create({
          personId: person.id,
          contactMethodId: contactMethod.id,
          message: formattedMessage,
        });

        console.log(`✅ Birthday message sent successfully to ${person.name}`);
        birthdayMessageCount++;
      }
    }

    console.log(`📱 Total attempts: ${people.length}`);

    return {
      birthdayMessageCount,
      people,
    };
  }
}
