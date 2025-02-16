import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { DatabaseUserRepository } from './infrastructure/repositories/database-user.repository';
import { BirthdayService } from './application/services/birthday.service';
import { WhatsappBirthdayMessageRepository } from './infrastructure/repositories/whatsapp-birthday-message.repository';
import { BirthdayController } from './presentation/controllers/birthday.controller';
import { DatabaseCommunicationRepository } from './infrastructure/repositories/database-communication.repository';

export class Server {
  private app = express();
  private readonly port: number;

  constructor(port: number) {
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    const databasePersonRepository = new DatabaseUserRepository();
    const databaseCommunicationRepository = new DatabaseCommunicationRepository(); 
    const whatsappBirthdayMessageRepository =
      new WhatsappBirthdayMessageRepository();

    const birthdayService = new BirthdayService(
      whatsappBirthdayMessageRepository,
      databasePersonRepository,
      databaseCommunicationRepository ,
    );

    const birthdayController = new BirthdayController(
      birthdayService,
    );

    this.app.get('/health', (_: Request, res: Response) => {
      res.send({
        status: 'ok',
      });
    });
    this.app.post('/api/birthday/send-messages', (req, res) =>
      birthdayController.sendTodayBirthdayMessages(req, res)
    );
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}
