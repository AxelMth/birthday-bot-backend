import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { createExpressEndpoints } from '@ts-rest/express';
import { birthdayContract } from 'birthday-bot-contracts';

import { birthdayRouter } from './router';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

createExpressEndpoints(birthdayContract, birthdayRouter, app);

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
