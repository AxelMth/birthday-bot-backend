import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

import { BirthdayMessageRepository } from '../../application/ports/output/message.repository';

const exec = promisify(execCb);

type SlackMetadata = {
  webhookUrl: string;
  userId: string;
};

export class SlackBirthdayMessageRepository
  implements BirthdayMessageRepository<SlackMetadata>
{
  async sendMessage(message: string, metadata: SlackMetadata): Promise<void> {
    const text = `${message} <@${metadata.userId}>`;
    const payload = JSON.stringify({ text }).replace(/'/g, "'\\''");
    const cmd = `curl --fail -sS -X POST -H "Content-type: application/json" --data '${payload}' ${metadata.webhookUrl}`;
    await exec(cmd);
  }
}
