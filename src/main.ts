import Fastify from 'fastify';
import { fastifyEnv } from '@fastify/env';

import { initServer } from '@ts-rest/fastify';

import { birthdayRouter, peopleRouter, contactMethodsRouter } from './presentation/routers';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Add error handler to ignore empty body errors on DELETE requests
server.setErrorHandler((error, request, reply) => {
  // Ignore FST_ERR_CTP_EMPTY_JSON_BODY for DELETE requests
  if (error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY' && request.method === 'DELETE') {
    // Continue processing the request as if no error occurred
    return;
  }
  
  // For all other errors, use default error handling
  server.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

// cors
server.register(import('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// env
server.register(fastifyEnv, {
  schema: {
    type: 'object',
    required: ['PORT'],
    properties: {
      PORT: {
        type: 'number',
        default: 3001,
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
