import { Request, Response } from 'express';
import { BirthdayUseCase } from '../../application/ports/input/birthday.use-case';
import { PersonRepository } from '@/application/ports/output/person.repository';

export class PersonController {
  constructor(private readonly personRepository: PersonRepository) {}

  public async syncPeople(req: Request, res: Response): Promise<void> {
    try {
      const people = await this.personRepository.getPeople();
      res.status(200).json(people);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
