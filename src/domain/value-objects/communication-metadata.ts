export interface SlackMetadata {
  channelId: string;
  personId: string;
}

export type CommunicationMetadata = {
  slack: SlackMetadata;
  // Add other app metadata types here
};
