import { Application } from './application';

export type SlackContactInfo = {
  channelId: string;
  userId: string;
};

export type ContactChannel =
  | { kind: Application.Slack; info: SlackContactInfo }
  // | { kind: Application.Email; info: EmailContactInfo }
  // | { kind: Application.Phone; info: PhoneContactInfo }
  ;
