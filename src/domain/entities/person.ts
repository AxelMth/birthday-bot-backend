import { ContactMethodMetadata } from "../value-objects/contact-method-metadata";
import { ContactMethod } from "./contact-method";

export class Person {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly birthDate?: Date,
    public readonly contactMethod?: ContactMethod,
    public readonly contactMethodMetadata?: ContactMethodMetadata
  ) {}
}
