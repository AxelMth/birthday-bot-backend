import { BirthdayMessageRepository } from '@/application/ports/output/birthday-message.repository';
import { Person } from '../../domain/entities/person';

export class WhatsappBirthdayMessageRepository
  implements BirthdayMessageRepository
{
  async sendMessage(person: Person, message: string): Promise<void> {
    // Implementation here
  }
}
