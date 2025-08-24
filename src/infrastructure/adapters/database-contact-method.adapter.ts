import { ContactMethod } from "../../domain/entities/contact-method";
import { Application } from "../../domain/value-objects/application";

interface DatabaseContactMethod {
  id: number;
  applicationName:
    | "slack"
    | "email"
    | "phone"
    | "sms"
    | "whatsapp"
    | "telegram";
}

export class DatabaseContactMethodAdapter {
  static toDomain(contactMethod: DatabaseContactMethod): ContactMethod {
    return new ContactMethod(
      contactMethod.id,
      contactMethod.applicationName as Application,
      {}, // Empty metadata since it's handled separately
    );
  }

  static toDatabase(contactMethod: ContactMethod): DatabaseContactMethod {
    return {
      id: contactMethod.id,
      applicationName: contactMethod.applicationName,
    };
  }
}
