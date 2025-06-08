import axios from 'axios';

import { BirthdayMessageRepository } from '../../application/ports/output/message.repository';

type SlackMetadata = {
  channelId: string;
  personId: string;
};

export class SlackBirthdayMessageRepository
  implements BirthdayMessageRepository<SlackMetadata>
{
  async sendMessage(message: string, metadata: SlackMetadata): Promise<void> {
    const url = 'https://slack.com/api/chat.postMessage';
    const data = JSON.stringify({
      channel: metadata.channelId,
      text: `${message} <@${metadata.personId}>`,
    });

    return axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
    });
  }
}
