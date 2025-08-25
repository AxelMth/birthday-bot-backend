import { ContactMethodRepository } from "../ports/output/contact-method.repository";
import { ContactMethodUseCase } from "../ports/input/contact-method.use-case";
import { ContactMethod } from "../../domain/entities/contact-method";
import { MetadataRepositoryFactory } from "../../infrastructure/factories/metadata-repository.factory";

export class ContactMethodService implements ContactMethodUseCase {
  constructor(
    private readonly contactMethodRepository: ContactMethodRepository,
  ) {}

  async getAllContactMethods(): Promise<ContactMethod[]> {
    const contactMethods =
      await this.contactMethodRepository.getAll();
    const uniqueApplicationNames = [
      ...new Set(
        contactMethods.map((contactMethod) => contactMethod.applicationName),
      ),
    ];
    const contactMethodsWithMetadata = await Promise.all(
      uniqueApplicationNames.map(async (applicationName) => {
        const metadataRepository =
          MetadataRepositoryFactory.getRepository(applicationName);
        const metadata = await metadataRepository.getMetadata();
        return {
          applicationName: applicationName,
          applicationMetadata: metadata,
        };
      }),
    );
    const metadataByApplicationName = contactMethodsWithMetadata.reduce(
      (acc, metadata) => {
        acc[metadata.applicationName] = metadata.applicationMetadata;
        return acc;
      },
      {} as Record<string, Record<string, string>>,
    );
    return contactMethods.map((contactMethod) => ({
      ...contactMethod,
      applicationMetadata:
        metadataByApplicationName[contactMethod.applicationName],
    }));
  }
}
