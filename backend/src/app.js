import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';

import contactsRouter from './routes/contacts.routes.js';
import sosRouter from './routes/sos.routes.js';
import riskRouter from './routes/risk.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Veera Backend API is running' });
});

app.use('/api/contacts', contactsRouter);
app.use('/api/sos', sosRouter);
app.use('/api/risk-score', riskRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', userRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
