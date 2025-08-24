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

      console.log(`📱 Sending Slack message to channel ${metadata.channelId}, user ${metadata.userId}`);

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
        const errorDetail = response.data.error || 'Unknown Slack API error';
        console.error(`🚫 Slack API error: ${errorDetail}`, response.data);
        throw new Error(`Slack API error: ${errorDetail}`);
      }

      console.log(`✅ Slack message sent successfully (ts: ${response.data.ts})`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const responseData = error.response?.data;
        
        console.error(`🌐 HTTP Error ${status} ${statusText}:`, responseData);
        throw new Error(`Failed to send Slack message: HTTP ${status} ${statusText}`);
      }
      
      if (error instanceof Error) {
        console.error(`💥 Slack send error: ${error.message}`);
        throw new Error(`Failed to send Slack message: ${error.message}`);
      }
      
      console.error("🔥 Unknown error sending Slack message:", error);
      throw new Error("Failed to send Slack message: Unknown error");
    }
  }
}
