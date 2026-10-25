import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import urlRoutes from './routes/url.js';
import redirectRoutes from './routes/redirect.js';

// Load config
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Route (Must be mounted before redirect routes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// API Routes
app.use('/api', urlRoutes);

// Redirect Routes (Wildcard redirection route mounted last)
app.use('/', redirectRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
