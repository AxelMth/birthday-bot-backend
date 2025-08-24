import { ContactMethodMetadataRepository } from "../../application/ports/output/metadata.repository";
import { Application } from "../../domain/value-objects/application";
import { ContactMethodMetadata } from "../../domain/value-objects/contact-method-metadata";
import { SlackMetadataRepository } from "../repositories/database-slack-metadata.repository";

export class MetadataRepositoryFactory {
  private static repositories: Record<
    Application,
    ContactMethodMetadataRepository
  > = {
    [Application.Slack]: new SlackMetadataRepository(),
    // [Application.Email]: new EmailMetadataRepository(),
    // [Application.Phone]: new PhoneMetadataRepository(),
    // [Application.Sms]: new SmsMetadataRepository(),
    // [Application.WhatsApp]: new WhatsAppMetadataRepository(),
    // [Application.Telegram]: new TelegramMetadataRepository(),
  };

  static getRepository(
    app: Application,
  ): ContactMethodMetadataRepository<
    ContactMethodMetadata[keyof ContactMethodMetadata]
  > {
    const repository = this.repositories[app];
    if (!repository) {
      throw new Error(`No metadata repository found for application ${app}`);
    }
    return repository as ContactMethodMetadataRepository<
      ContactMethodMetadata[keyof ContactMethodMetadata]
    >;
  }
}
