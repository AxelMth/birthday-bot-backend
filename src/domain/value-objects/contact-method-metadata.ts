export interface SlackMetadata {
  id: number;
  channelId: string;
  userId: string;
}

export type ContactMethodMetadata = {
  slack: SlackMetadata;
  // email: EmailMetadata;
  // phone: PhoneMetadata;
  // sms: SmsMetadata;
  // whatsapp: WhatsAppMetadata;
  // telegram: TelegramMetadata;
};
