require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./src/config/db');
const { logger, morganStream } = require('./src/config/logger');
const ministryRoutes = require('./src/routes/ministry.routes');
const sermonRoutes = require('./src/routes/sermon.routes');
const errorHandler = require('./src/middleware/errorHandler');
const swaggerDocs = require('./src/config/swagger');

const app = express();

// Security & Logging Middleware
app.use(helmet());
app.use(morgan('combined', { stream: morganStream }));      // Production logging
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
//app.use(mongoSanitize());                       // Prevent NoSQL injection

// Rate limiting (100 requests per 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Database
connectDB();

// Routes
app.use('/api/v1/ministries', ministryRoutes);
app.use('/api/v1/sermons', sermonRoutes);

// Initialize Swagger Docs (mounts at /api-docs)
swaggerDocs(app);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});