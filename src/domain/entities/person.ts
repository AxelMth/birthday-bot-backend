import { ContactChannel } from "../value-objects/contact-info";

export class Person {
  constructor(
    public readonly id: number,
    public name: string,
    public birthDate?: Date,
    private _preferredContact?: ContactChannel,
    public groupId?: number,
    public groupName?: string,
  ) {}

  get preferredContact(): ContactChannel | undefined {
    return this._preferredContact;
  }

  setPreferredContact(channel: ContactChannel | undefined) {
    this._preferredContact = channel;
  }

  updateProfile(name: string, birthDate?: Date) {
    this.name = name;
    this.birthDate = birthDate;
  }
}
