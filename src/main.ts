import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { createExpressEndpoints, initServer } from '@ts-rest/express';
import { birthdayRouter } from './router';
import { birthdayContract } from './presentation/contracts/birthday.contract';
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

createExpressEndpoints(birthdayContract, birthdayRouter, app);

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
