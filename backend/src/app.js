import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
<<<<<<< HEAD
import userRouter from './routes/user.route.js';
=======
import userRouter from './routes/user.route.js'
>>>>>>> 556c257d73276443a0a738a543b1d15a504f7202

// Routes
import contactsRouter from './routes/contacts.routes.js';
import sosRouter from './routes/sos.routes.js';
import riskRouter from './routes/risk.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

const app = express();

// DB connection
connectDB();

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Veera Backend API is running 🚀' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', userRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/sos', sosRouter);
app.use('/api/risk-score', riskRouter);
app.use('/api/dashboard', dashboardRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Internal Server Error' });
});

<<<<<<< HEAD
=======

//api of auth
app.use('/api/auth',userRouter)

>>>>>>> 556c257d73276443a0a738a543b1d15a504f7202
export default app;
