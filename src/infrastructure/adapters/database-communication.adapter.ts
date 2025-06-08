import { Communication } from '../../domain/entities/communication';
import { Application } from '../../domain/value-objects/application';

interface DatabaseCommunication {
  id: number;
  personId: number;
  application: 'slack' | 'email';
}

export class DatabaseCommunicationAdapter {
  static toDomain(communication: DatabaseCommunication): Communication {
    return new Communication(
      communication.id,
      communication.personId,
      communication.application as Application
    );
  }

  static toDatabase(communication: Communication): DatabaseCommunication {
    return {
      id: communication.id,
      personId: communication.personId,
      application: communication.application,
    };
  }
}
