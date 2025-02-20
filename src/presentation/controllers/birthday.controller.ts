import { BirthdayService } from '@/application/services/birthday.service';
import { Request, Response } from 'express';

export class BirthdayController {
  constructor(private readonly birthdayService: BirthdayService) {}

  async sendTodayBirthdayMessages(req: Request, res: Response): Promise<void> {
    try {
      await this.birthdayService.sendTodayBirthdayMessages();
      res.status(200).json({
        message: 'Birthday messages sent successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async getNextBirthdaysUntil(req: Request, res: Response): Promise<void> {
    try {
      if (!req.query.date) {
        throw new Error('Date is required');
      }
      const date = new Date(req.query.date as string);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      const people = await this.birthdayService.getNextBirthdaysUntil(date);
      res.status(200).json(people);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
