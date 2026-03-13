import { eq } from "drizzle-orm";
import { GroupRepository } from "../../application/ports/output/group.repository";
import { Group } from "../../domain/entities/group";
import { db } from "../../db";
import { groups } from "../../db/schema";

export class DatabaseGroupRepository implements GroupRepository {
  async getAll(): Promise<Group[]> {
    const rows = await db.select().from(groups);
    return rows.map((r) => new Group(r.id, r.name));
  }

  async getById(id: number): Promise<Group> {
    const [row] = await db.select().from(groups).where(eq(groups.id, id));
    if (!row) throw new Error(`Group with id ${id} not found`);
    return new Group(row.id, row.name);
  }

  async create(name: string): Promise<Group> {
    const [row] = await db.insert(groups).values({ name }).returning();
    return new Group(row.id, row.name);
  }

  async update(id: number, name: string): Promise<Group> {
    const [row] = await db
      .update(groups)
      .set({ name })
      .where(eq(groups.id, id))
      .returning();
    if (!row) throw new Error(`Group with id ${id} not found`);
    return new Group(row.id, row.name);
  }

  async delete(id: number): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }
}
