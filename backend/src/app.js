import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import {userRouter} from './routes/user.route.js'

const app = express();

connectDB()

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Veera Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//api of auth
app.use('./api/auth',userRouter)

export default app;
