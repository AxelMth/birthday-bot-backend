import { Communication } from '../../domain/entities/communication';
import { Application } from '../../domain/value-objects/application';

interface DatabaseCommunication {
  id: number;
  personId: number;
  application: string;
}

export class DatabaseCommunicationAdapter {
  static toDomain(communication: DatabaseCommunication): Communication {
    return new Communication(
      communication.id,
      communication.personId,
      communication.application as Application
    );
  }
}
