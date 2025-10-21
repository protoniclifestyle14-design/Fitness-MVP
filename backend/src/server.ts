import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';

const app = express();

// Security & utilities
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', authLimiter);

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (process.env.NODE_ENV !== 'production') console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`
🚀 Protonic Backend Server Running!
📡 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Server: http://localhost:${port}
💚 Health: http://localhost:${port}/health
🔐 Auth API: http://localhost:${port}/auth
  `);
});