import { initServer } from "@ts-rest/fastify";
import { authContract } from "birthday-bot-contracts";

const s = initServer();


export const authRouter = s.router(authContract, {
  validate: {
    handler: async (req) => {
      const apiKey = req.headers["x-api-key"];
      return {
        status: 200,
        body: {
          isAdmin: apiKey === process.env.API_KEY,
        },
      };
    }
  },
});
