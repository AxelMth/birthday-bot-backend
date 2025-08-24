import { eq } from "drizzle-orm";

import { db} from "../../db";
import { contactMethods as contactMethodsTable } from "../../db/schema";

import { DatabaseContactMethodAdapter } from "../adapters/database-contact-method.adapter";
import { ContactMethodRepository } from "../../application/ports/output/contact-method.repository";
import { ContactMethod } from "../../domain/entities/contact-method";
import { Application } from "../../domain/value-objects/application";

export class DatabaseContactMethodRepository
  implements ContactMethodRepository
{
  async getAllContactMethods(): Promise<ContactMethod[]> {
    const contactMethods = await db.select().from(contactMethodsTable);
    return contactMethods.map(DatabaseContactMethodAdapter.toDomain);
  }

  async getContactMethodByApplication(application: Application): Promise<ContactMethod> {
    const [contactMethod] = await db.select().from(contactMethodsTable).where(eq(contactMethodsTable.applicationName, application));
    if (!contactMethod) {
      throw new Error(`Contact method not found for application ${application}`);
    }
    return DatabaseContactMethodAdapter.toDomain(contactMethod);
  }
}
