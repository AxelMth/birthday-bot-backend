export interface BirthdayMessageRepository<M = any> {
  sendMessage(
    message: string,
    metadata: M,
    token: string,
  ): Promise<void>;
}
