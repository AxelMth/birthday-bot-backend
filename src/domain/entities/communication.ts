export type CommunicationStatus = 'pending' | 'sent' | 'failed' | 'delivered';
export type CommunicationType = 'birthday_message' | 'reminder' | 'notification' | 'other';

export class Communication {
  constructor(
    public readonly id: number,
    public readonly personId: number,
    public readonly contactMethodId: number,
    public readonly message: string,
    public readonly sentAt?: Date,
  ) {}
}
