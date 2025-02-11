import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { NotionPersonRepository } from './infrastructure/repositories/notion-person.repository';
import { BirthdayService } from './application/services/birthday.service';
import { WhatsappBirthdayMessageRepository } from './infrastructure/repositories/whatsapp-birthday-message.repository';
import { BirthdayController } from './presentation/controllers/birthday.controller';
import { PersonController } from './presentation/controllers/person.controller';
import { PersonService } from './application/services/person.service';

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
    const notionPersonRepository = new NotionPersonRepository();
    const whatsappBirthdayMessageRepository =
      new WhatsappBirthdayMessageRepository();

    const birthdayService = new BirthdayService(
      notionPersonRepository,
      whatsappBirthdayMessageRepository
    );
    const personService = new PersonService(notionPersonRepository);

    const birthdayController = new BirthdayController(birthdayService);
    const personController = new PersonController(personService);

    this.app.get('/health', (_: Request, res: Response) => {
      res.send({
        status: 'ok',
      });
    });
    this.app.post('/api/birthday/send-messages', (req, res) =>
      birthdayController.sendTodayBirthdayMessages(req, res)
    );
    this.app.post('/api/person/get-from-notion', (req, res) =>
      personController.syncPeople(req, res)
    );
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}
