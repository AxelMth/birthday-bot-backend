import { Group } from "../../../domain/entities/group";

export interface GroupUseCase {
  getAll(): Promise<Group[]>;
  getById(id: number): Promise<Group>;
  create(name: string): Promise<Group>;
  update(id: number, name: string): Promise<Group>;
  delete(id: number): Promise<void>;
}
