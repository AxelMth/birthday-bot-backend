import { BirthdayService } from '@/application/services/birthday.service';
import { PeopleService } from '@/application/services/people.service';
import { Request, Response } from 'express';

export class BirthdayController {
  constructor(
    private readonly birthdayService: BirthdayService,
    private readonly peopleService: PeopleService
  ) {}

  async sendTodayBirthdayMessages(req: Request, res: Response): Promise<void> {
    try {
      const people = await this.peopleService.getPeople();
      await this.birthdayService.sendTodayBirthdayMessages(people);
      res.status(200).json(people);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
