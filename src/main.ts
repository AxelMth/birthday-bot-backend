import Fastify from 'fastify';
import { fastifyEnv } from '@fastify/env';

import { initServer } from '@ts-rest/fastify';

import { birthdayRouter, peopleRouter } from './presentation/routers';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// cors
server.register(require('@fastify/cors'), {
  origin: '*',
});

// env
server.register(fastifyEnv, {
  schema: {
    type: 'object',
    required: ['PORT'],
    properties: {
      PORT: {
        type: 'number',
        default: 3000,
      },
      DATABASE_URL: {
        type: 'string',
      },
    },
  },
  dotenv: true,
});

// Routes
const s = initServer();
server.register(s.plugin(birthdayRouter));
server.register(s.plugin(peopleRouter));

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
