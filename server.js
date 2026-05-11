require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./src/config/db');
const { logger, morganStream } = require('./src/config/logger');
const ministryRoutes = require('./src/routes/ministry.routes');
const sermonRoutes = require('./src/routes/sermon.routes');
const eventRoutes = require('./src/routes/event.routes');
const projectRoutes = require('./src/routes/project.routes');
const testimonyRoutes = require('./src/routes/testimony.routes');
const blogRoutes = require('./src/routes/blog.routes');
const prayerRequestRoutes = require('./src/routes/prayerRequest.routes');
const contactMessageRoutes = require('./src/routes/contactMessage.routes');
const statsRoutes = require('./src/routes/stats.routes'); 
const userRoutes = require('./src/routes/user.routes');

const errorHandler = require('./src/middleware/errorHandler');
const swaggerDocs = require('./src/config/swagger');

const app = express();

const rawOrigins = process.env.ALLOWED_ORIGINS?.trim();
app.use(cors({ 
  origin: !rawOrigins || rawOrigins === '*' ? '*' : rawOrigins.split(',').map(o => o.trim()),
  credentials: true 
}));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: "Backend is working well",
    timestamp: new Date().toISOString() 
  });
});

// Add this right after you initialize: const app = express();
const APP_URL = process.env.APP_URL || '';

// ─── Static file serving ──────────────────────────────────────────────────────
// Serves /public on every environment (local, cPanel, AWS, etc.).
// Images are accessed at  <APP_URL>/uploads/<filename>  — fully dynamic.
// The path.join is relative to this file so it resolves correctly regardless
// of the working directory the process is started from.

app.use(express.static(path.join(__dirname, 'public')));

//app.use(`${APP_URL}/`, express.static(path.join(__dirname, 'public')));

// Security & Logging Middleware
app.use(helmet());
app.use(morgan('combined', { stream: morganStream }));      // Production logging

app.use(express.json({ limit: '10mb' }));
//app.use(mongoSanitize());                       // Prevent NoSQL injection

// Rate limiting (100 requests per 15 min per IP)
// DISABLED during tests so concurrent tests pass
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', limiter);
}

// Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
} else {
  console.log('🧪 TEST MODE - Using in-memory MongoDB (real DB skipped)');
}

// Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/ministries', ministryRoutes);
app.use('/api/v1/sermons', sermonRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/testimonies', testimonyRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/prayer-requests', prayerRequestRoutes);
app.use('/api/v1/contact-messages', contactMessageRoutes);
app.use('/api/v1/stats', statsRoutes); 

// Initialize Swagger Docs (mounts at /api-docs)
swaggerDocs(app);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);

  logger.info(`✅ Server running`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || `http://localhost:${PORT}`,
  });
});

module.exports = app;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  logger.info('🛑 SIGTERM received — shutting down gracefully');

  server.close(() => process.exit(0));
});