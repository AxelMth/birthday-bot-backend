export interface SlackMetadata {
  channelId: string;
  userId: string;
}

export type ContactMethodMetadata = {
  slack: SlackMetadata;
  // Add other app metadata types here
};
