import { Person } from '../../domain/entities/person';
import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/message.repository';
import { CommunicationRepository } from '../ports/output/communication.repository';
import { PersonRepository } from '../ports/output/person.repository';

export class BirthdayService implements BirthdayUseCase {
  constructor(
    private readonly birthdayMessageRepository: BirthdayMessageRepository,
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
      console.log(`Found ${communications.length} communications for ${person.name}`  );

      await this.birthdayMessageRepository.sendMessage(
        person,
        `Happy birthday, ${person.name}!`
      );
    }
  }
}
