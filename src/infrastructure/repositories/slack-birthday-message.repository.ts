import axios from "axios";
import { BirthdayMessageRepository } from "../../application/ports/output/message.repository";

type SlackMetadata = {
  id: number;
  channelId: string;
  userId: string;
};

export class SlackBirthdayMessageRepository
  implements BirthdayMessageRepository<SlackMetadata>
{
  private readonly slackToken: string;

  constructor() {
    this.slackToken =
      process.env.SLACK_BOT_USER_OAUTH_TOKEN ||
      process.env.SLACK_USER_OAUTH_TOKEN ||
      "";
    if (!this.slackToken) {
      throw new Error(
        "SLACK_BOT_USER_OAUTH_TOKEN or SLACK_USER_OAUTH_TOKEN environment variable is required",
      );
    }
  }

  async sendMessage(message: string, metadata: SlackMetadata): Promise<void> {
    try {
      // Replace {name} placeholder with Slack user mention
      const text = message.replace(/{name}/g, `<@${metadata.userId}>`);

      const response = await axios.post(
        "https://slack.com/api/chat.postMessage",
        {
          channel: metadata.channelId,
          text: text,
        },
        {
          headers: {
            Authorization: `Bearer ${this.slackToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send Slack message: ${error.message}`);
      }
      throw new Error("Failed to send Slack message: Unknown error");
    }
  }
}
