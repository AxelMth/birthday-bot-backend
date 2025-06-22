import { Application } from '../value-objects/application';

export class ContactMethod {
  constructor(
    public readonly id: number,
    public readonly personId: number,
    public readonly application: Application,
    public readonly metadata: Record<string, unknown>
  ) {}
}
