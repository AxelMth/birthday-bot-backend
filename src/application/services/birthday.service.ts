import { Person } from '../../domain/entities/person';
import { BirthdayUseCase } from '../ports/input/birthday.use-case';
import { BirthdayMessageRepository } from '../ports/output/birthday-message.repository';
import { PersonRepository } from '../ports/output/person.repository';

export class BirthdayService implements BirthdayUseCase {
  constructor(
    private readonly birthdayMessageRepository: BirthdayMessageRepository
  ) {}

  async sendTodayBirthdayMessages(people: Person[]): Promise<void> {
    const today = new Date();
    console.log(`Sending birthday messages for ${today.toISOString()}`);

    console.log(`Found ${people.length} birthdays`);

    for (const person of people) {
      await this.birthdayMessageRepository.sendMessage(
        person,
        'Happy Birthday!'
      );
    }
  }
}
