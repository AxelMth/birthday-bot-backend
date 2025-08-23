import { Application } from '../value-objects/application';

export class ContactMethod {
  constructor(
    public readonly id: number,
    public readonly applicationName: Application,
  ) {}
}
