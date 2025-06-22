import { ContactMethod } from '../../domain/entities/contact-method';
import { Application } from '../../domain/value-objects/application';

interface DatabaseContactMethod {
  id: number;
  personId: number;
  application: 'slack' | 'email';
}

export class DatabaseContactMethodAdapter {
  static toDomain(contactMethod: DatabaseContactMethod): ContactMethod {
    return new ContactMethod(
      contactMethod.id,
      contactMethod.personId,
      contactMethod.application as Application,
      {}
    );
  }

  static toDatabase(contactMethod: ContactMethod): DatabaseContactMethod {
    return {
      id: contactMethod.id,
      personId: contactMethod.personId,
      application: contactMethod.application,
    };
  }
}
