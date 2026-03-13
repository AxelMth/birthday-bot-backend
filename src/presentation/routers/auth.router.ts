import { initServer } from "@ts-rest/fastify";
import { authContract } from "birthday-bot-contracts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { db } from "../../db";
import { adminUsers } from "../../db/schema";
import { eq } from "drizzle-orm";

const s = initServer();

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_KEY || "change-me";

function verifyJwt(token: string): { username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string };
  } catch {
    return null;
  }
}

export const authRouter = s.router(authContract, {
  validate: {
    handler: async (req) => {
      // Support JWT Bearer token
      const authHeader = req.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const payload = verifyJwt(token);
        if (payload) {
          return {
            status: 200,
            body: { isAdmin: true },
          };
        }
      }

      // Legacy: support x-api-key header
      const apiKey = req.headers["x-api-key"];
      if (apiKey && apiKey === process.env.API_KEY) {
        return {
          status: 200,
          body: { isAdmin: true },
        };
      }

      return {
        status: 200,
        body: { isAdmin: false },
      };
    },
  },
  login: async ({ body }) => {
    const { username, password } = body;

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));

    if (!user) {
      return {
        status: 401,
        body: { error: "Invalid username or password" },
      };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return {
        status: 401,
        body: { error: "Invalid username or password" },
      };
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: "30d",
    });

    return {
      status: 200,
      body: { token, username: user.username },
    };
  },
});
