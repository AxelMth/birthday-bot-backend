import axios from 'axios';

import { BirthdayMessageRepository } from '@/application/ports/output/message.repository';
import { Person } from '../../domain/entities/person';

export class SlackBirthdayMessageRepository
  implements BirthdayMessageRepository
{
  async sendMessage(person: Person, message: string): Promise<void> {
    console.log(`Sending slack message to ${person.name}: ${
      message
    }`);
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('SLACK_WEBHOOK_URL is not set');
    }
    await axios.post(webhookUrl, {
      text: message,
    })
  }
}
