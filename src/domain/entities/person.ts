import { ContactChannel } from "../value-objects/contact-info";

export class Person {
  constructor(
    public readonly id: number,
    public name: string,
    public birthDate?: Date,
    private _preferredContact?: ContactChannel,
  ) {}

  get preferredContact(): ContactChannel | undefined {
    return this._preferredContact;
  }

  setPreferredContact(channel: ContactChannel | undefined) {
    // Add domain invariants if any (e.g., slack requires both ids)
    this._preferredContact = channel;
  }

  updateProfile(name: string, birthDate?: Date) {
    this.name = name;
    this.birthDate = birthDate;
  }
}
