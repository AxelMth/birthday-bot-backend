import { Application } from '../value-objects/application';

export class Communication {
  constructor(
    public readonly id: number,
    public readonly personId: number,
    public readonly application: Application
  ) {}
}
