import { BirthdayService } from '@/application/services/birthday.service';
import { Request, Response } from 'express';

export class BirthdayController {
  constructor(private readonly birthdayService: BirthdayService) {}

  async sendTodayBirthdayMessages(req: Request, res: Response): Promise<void> {
    try {
      const people = await this.birthdayService.sendTodayBirthdayMessages();

      res.status(200).json(people);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
