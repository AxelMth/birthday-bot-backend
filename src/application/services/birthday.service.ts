import { Person } from '../../domain/entities/person';
import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/message.repository';
import { CommunicationRepository } from '../ports/output/communication.repository';
import { PersonRepository } from '../ports/output/person.repository';
import { Application } from '@/domain/value-objects/application';

export class BirthdayService implements BirthdayUseCase {
  constructor(
    private readonly messageRepositoriesByApplication: Record<Application, BirthdayMessageRepository>,
    private readonly personRepository: PersonRepository,
    private readonly communicationRepository: CommunicationRepository,
  ) {}

  async sendTodayBirthdayMessages(): Promise<void> {
    const people = await this.personRepository.getPeopleByBirthday(new Date());
    if (people.length === 0) {
      console.log('No birthdays today');
      return;
    }

    console.log(`Found ${people.length} birthdays`);
    for (const person of people) {
      const communications = await this.communicationRepository.getByPersonId(person.id);
      if (communications.length === 0) {
        console.log(`No communications found for ${person.name}`);
        continue  
      }
      for (const communication of communications) {
        if (!this.messageRepositoriesByApplication[communication.application]) {
          console.log(`No message repository found for ${communication.application}`);
          continue;
        }
        const birthdayMessageRepository = this.messageRepositoriesByApplication[communication.application];
        await birthdayMessageRepository.sendMessage(person, "Happy birthday!");
      }
    }
  }
}
