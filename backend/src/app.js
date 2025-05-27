import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './db/sequelize.js';
import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import databricksRoutes from './routes/databricksRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
import process from 'process';

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware for diagnostics
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'src/frontend/dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/databricks', databricksRoutes); // Mount the new routes
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes

// SPA fallback for frontend routes
app.use((req, res, next) => {
  const isApi = req.url.startsWith('/api/');
  const isAsset = req.url.includes('.');
  if (!isApi && !isAsset) {
    res.sendFile(path.join(__dirname, 'src/frontend/dist/index.html'));
  } else {
    next();
  }
});

// Sync all models to the database
sequelize.sync({ alter: true }) // or { force: true } for dropping & recreating tables
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((err) => {
    console.error('Unable to sync models:', err);
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
