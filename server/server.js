const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase, dbAll } = require('./database');
const expensesRouter = require('./routes/expenses');
const contributionsRouter = require('./routes/contributions');
const dashboardRouter = require('./routes/dashboard');
const tripsRouter = require('./routes/trips');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files from React build in production
if (NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
}

// Initialize database
initializeDatabase();

// API Routes
app.use('/api/expenses', expensesRouter);
app.use('/api/contributions', contributionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/trips', tripsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const expenseCount = await dbAll('SELECT COUNT(*) as count FROM expenses');
    const dbSize = await dbAll("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
    
    res.json({
      status: 'Server is running',
      environment: NODE_ENV,
      database: {
        connected: true,
        expenses: expenseCount[0]?.count || 0,
        dbPath: process.env.DB_PATH || 'local',
        sizeBytes: dbSize[0]?.size || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'Server error',
      environment: NODE_ENV,
      database: { connected: false, error: err.message }
    });
  }
});

// Serve React app for all other routes (SPA routing)
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
