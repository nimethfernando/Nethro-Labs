import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './src/config/db.js';
import { notFound, globalErrorHandler } from './src/middleware/errorHandler.js';

import authRoutes         from './src/routes/auth.js';
import ticketRoutes       from './src/routes/tickets.js';
import projectRoutes      from './src/routes/projects.js';
import invoiceRoutes      from './src/routes/invoices.js';
import notificationRoutes from './src/routes/notifications.js';
import adminRoutes        from './src/routes/admin.js';
import clientRoutes       from './src/routes/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── SECURITY MIDDLEWARE ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── RATE LIMITING ────────────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again in 15 minutes.' },
}));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: { success: false, message: 'Too many requests, please slow down.' },
}));

// ── REQUEST PARSERS ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── LOGGER ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── STATIC ASSETS ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── HEALTH SYSTEM CHECK ──────────────────────────────────
app.get('/health', (req, res) => res.json({
  success: true, 
  status: 'OK',
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

// ── ACTIVE APPLICATION ROUTES ───────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/tickets',       ticketRoutes);
app.use('/api/projects',      projectRoutes);
app.use('/api/invoices',      invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/client',        clientRoutes);

// ── ERROR ORCHESTRATION ──────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

// ── SECURE LIFECYCLE INITIALIZATION ──────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Establish database handshake before opening server channel listeners
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Nethro Labs API running on port ${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error(`❌ Critical System Failure: Core initialization halted. Reason: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;