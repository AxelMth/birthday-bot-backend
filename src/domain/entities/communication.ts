export type CommunicationStatus = 'pending' | 'sent' | 'failed' | 'delivered';
export type CommunicationType = 'birthday_message' | 'reminder' | 'notification' | 'other';

export interface Communication {
  id: number;
  personId: number;
  contactMethodId: number;
  message: string;
  sentAt?: Date;
}
