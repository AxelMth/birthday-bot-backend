import { eq, inArray } from "drizzle-orm";

import { db} from "../../db";
import { contactMethods as contactMethodsTable } from "../../db/schema";

import { DatabaseContactMethodAdapter } from "../adapters/database-contact-method.adapter";
import { ContactMethodRepository } from "../../application/ports/output/contact-method.repository";
import { ContactMethod } from "../../domain/entities/contact-method";
import { Application } from "../../domain/value-objects/application";

export class DatabaseContactMethodRepository
  implements ContactMethodRepository
{
  async getAll(): Promise<ContactMethod[]> {
    const contactMethods = await db.select().from(contactMethodsTable);
    return contactMethods.map(DatabaseContactMethodAdapter.toDomain);
  }

  async getByApplication(application: Application): Promise<ContactMethod> {
    const [contactMethod] = await db.select().from(contactMethodsTable).where(eq(contactMethodsTable.applicationName, application));
    if (!contactMethod) {
      throw new Error(`Contact method not found for application ${application}`);
    }
    return DatabaseContactMethodAdapter.toDomain(contactMethod);
  }

  async getByIds(ids: number[]): Promise<ContactMethod[]> {
    const contactMethods = await db.select().from(contactMethodsTable).where(inArray(contactMethodsTable.id, ids));
    return contactMethods.map(DatabaseContactMethodAdapter.toDomain);
  }
}
