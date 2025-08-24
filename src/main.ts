import Fastify from "fastify";
import { fastifyEnv } from "@fastify/env";

import { initServer } from "@ts-rest/fastify";

import {
  birthdayRouter,
  peopleRouter,
  contactMethodsRouter,
} from "./presentation/routers";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Allow empty JSON bodies
server.addContentTypeParser("application/json", { parseAs: "string" }, function (
  req,
  body,
  done,
) {
  if (!body || body.toString().trim() === "") {
    return done(null, {}); // treat empty body as empty object
  }
  try {
    done(null, JSON.parse(body.toString()));
  } catch (err) {
    done(err);
  }
});

// Add error handler to ignore empty body errors on DELETE requests
server.setErrorHandler((error, request, reply) => {
  // For all other errors, use default error handling
  server.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

// cors
server.register(import("@fastify/cors"), {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// env
server.register(fastifyEnv, {
  schema: {
    type: "object",
    required: ["PORT"],
    properties: {
      PORT: {
        type: "number",
        default: 3001,
      },
      DATABASE_URL: {
        type: "string",
      },
    },
  },
  dotenv: true,
});

// Routes
const s = initServer();
server.register(s.plugin(birthdayRouter));
server.register(s.plugin(peopleRouter));
server.register(s.plugin(contactMethodsRouter));

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
