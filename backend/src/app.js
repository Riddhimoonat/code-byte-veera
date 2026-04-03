import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRouter from './routes/user.route.js'
import cookieParser from 'cookie-parser';
import contactsRouter from './routes/contacts.routes.js';
import sosRouter from './routes/sos.routes.js';
import riskRouter from './routes/risk.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

const app = express();

// DB connection
connectDB();

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Veera Backend API is running' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
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


//api of auth
app.use('/api/auth',userRouter)

export default app;
