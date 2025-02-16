import { BirthdayService } from '@/application/services/birthday.service';
import { PeopleService } from '@/application/services/people.service';
import { Request, Response } from 'express';

export class BirthdayController {
  constructor(
    private readonly birthdayService: BirthdayService,
  ) {}

  async sendTodayBirthdayMessages(req: Request, res: Response): Promise<void> {
    try {
      await this.birthdayService.sendTodayBirthdayMessages()
      res.status(200).json(
        {
          message: 'Birthday messages sent successfully',
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
