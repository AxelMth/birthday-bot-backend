import { Communication } from "../../domain/entities/communication";

interface DatabaseCommunication {
  id: number;
  personId: number;
  contactMethodId: number;
  message: string;
  sentAt: Date;
}


export class DatabaseCommunicationAdapter {
  static toDomain(communication: DatabaseCommunication): Communication {
    return new Communication(communication.id, communication.personId, communication.contactMethodId, communication.message, communication.sentAt);
  }

  static toDatabase(communication: Communication): DatabaseCommunication {
    return {
      id: communication.id,
      personId: communication.personId,
      contactMethodId: communication.contactMethodId,
      message: communication.message,
      sentAt: communication.sentAt,
    };
  }
}
