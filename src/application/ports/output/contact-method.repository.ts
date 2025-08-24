import { ContactMethod } from "../../../domain/entities/contact-method";
import { Application } from "../../../domain/value-objects/application";

export interface ContactMethodRepository {
  getAllContactMethods(): Promise<ContactMethod[]>;
  getContactMethodByApplication(application: Application): Promise<ContactMethod>;
}
