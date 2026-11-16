import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { csrfGuard } from './middleware/csrfGuard.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';

export const app = express();

// The order below is the order of the checkpoints every request walks through.
app.use(requestId);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(csrfGuard);

app.get('/api/health', (req, res) => {
  res.json({ data: { status: 'ok' } });
});

// Routes for later steps go ABOVE these two lines.
app.use('/api', notFoundHandler);
app.use(errorHandler);