import { CommunicationMetadataRepository } from '../../application/ports/output/metadata.repository';
import { Application } from '../../domain/value-objects/application';
import { CommunicationMetadata } from '../../domain/value-objects/communication-metadata';
import { SlackMetadataRepository } from '../repositories/database-slack-metadata.repository';

export class MetadataRepositoryFactory {
  private static repositories: Record<
    Application,
    CommunicationMetadataRepository
  > = {
    [Application.Slack]: new SlackMetadataRepository(),
  };

  static getRepository(
    app: Application
  ): CommunicationMetadataRepository<
    CommunicationMetadata[keyof CommunicationMetadata]
  > {
    const repository = this.repositories[app];
    if (!repository) {
      throw new Error(`No metadata repository found for application ${app}`);
    }
    return repository as CommunicationMetadataRepository<
      CommunicationMetadata[keyof CommunicationMetadata]
    >;
  }
}
