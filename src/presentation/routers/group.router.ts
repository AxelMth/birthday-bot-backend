import { initServer } from "@ts-rest/fastify";
import { groupContract } from "birthday-bot-contracts";

import { DatabaseGroupRepository } from "../../infrastructure/repositories/database-group.repository";
import { GroupService } from "../../application/services/group.service";

const s = initServer();

const groupRepository = new DatabaseGroupRepository();
const groupService = new GroupService(groupRepository);

export const groupRouter = s.router(groupContract, {
  getGroups: async () => {
    const groups = await groupService.getAll();
    return {
      status: 200,
      body: {
        groups: groups.map((g) => ({ id: g.id, name: g.name })),
      },
    };
  },
  createGroup: async ({ body }) => {
    const group = await groupService.create(body.name);
    return {
      status: 200,
      body: { id: group.id, name: group.name },
    };
  },
  updateGroup: async ({ params, body }) => {
    const group = await groupService.update(params.id, body.name);
    return {
      status: 200,
      body: { id: group.id, name: group.name },
    };
  },
  deleteGroup: async ({ params }) => {
    await groupService.delete(params.id);
    return {
      status: 200,
      body: { success: true },
    };
  },
});
