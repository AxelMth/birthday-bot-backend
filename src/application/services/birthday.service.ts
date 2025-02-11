import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/birthday-message.repository';
import { PersonRepository } from '../ports/output/person.repository';

export class BirthdayService implements BirthdayUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly birthdayMessageRepository: BirthdayMessageRepository
  ) {}

  async sendTodayBirthdayMessages(): Promise<void> {
    const today = new Date();
    console.log(`Sending birthday messages for ${today.toISOString()}`);

    const persons = await this.personRepository.getPeople();
    console.log(`Found ${persons.length} birthdays`);

    for (const person of persons) {
      await this.birthdayMessageRepository.sendMessage(
        person,
        'Happy Birthday!'
      );
    }
  }
}
