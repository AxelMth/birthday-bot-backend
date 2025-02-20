export interface BirthdayMessageRepository<M = any> {
  sendMessage(message: string, metadata: M): Promise<void>;
}
