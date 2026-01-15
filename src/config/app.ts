import express from 'express';
import { categoryRoutes, questionsRoutes } from '../routes/index.js';
import { errorHandler } from '../middleware/index.js';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionsRoutes);

app.use(errorHandler);

export default app;
