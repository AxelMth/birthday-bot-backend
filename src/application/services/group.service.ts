import { GroupUseCase } from "../ports/input/group.use-case";
import { GroupRepository } from "../ports/output/group.repository";
import { Group } from "../../domain/entities/group";

export class GroupService implements GroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getAll(): Promise<Group[]> {
    return this.groupRepository.getAll();
  }

  async getById(id: number): Promise<Group> {
    return this.groupRepository.getById(id);
  }

  async create(name: string): Promise<Group> {
    return this.groupRepository.create(name);
  }

  async update(id: number, name: string): Promise<Group> {
    return this.groupRepository.update(id, name);
  }

  async delete(id: number): Promise<void> {
    return this.groupRepository.delete(id);
  }
}
