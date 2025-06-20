import { Application } from '../value-objects/application';

// FIXME: Find a better name (communication should be different than contact method)
export class Communication {
  constructor(
    public readonly id: number,
    public readonly personId: number,
    public readonly application: Application,
    public readonly metadata: Record<string, unknown>
  ) {}
}
