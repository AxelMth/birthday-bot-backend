export interface SlackMetadata {
  channelId: string;
  userId: string;
}

export type CommunicationMetadata = {
  slack: SlackMetadata;
  // Add other app metadata types here
};
