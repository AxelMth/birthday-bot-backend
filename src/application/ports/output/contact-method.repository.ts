import { ContactMethod } from "../../../domain/entities/contact-method";
import { Application } from "../../../domain/value-objects/application";

export interface ContactMethodRepository {
  getAll(): Promise<ContactMethod[]>;
  getByIds(ids: number[]): Promise<ContactMethod[]>;
  getByApplication(application: Application): Promise<ContactMethod>;
}
