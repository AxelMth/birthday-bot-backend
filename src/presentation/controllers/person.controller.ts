import { Request, Response } from 'express';
import { PersonService } from '@/application/services/person.service';

export class PersonController {
  constructor(private readonly personService: PersonService) {}

  public async syncPeople(req: Request, res: Response): Promise<void> {
    try {
      await this.personService.syncPeople();
      res.status(200).json({
        message: 'People synced',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
