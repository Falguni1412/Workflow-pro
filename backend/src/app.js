
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { sequelize, Role } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const requestRoutes = require('./routes/requestRoutes');

const { errorHandler } = require('./middlewares/error');

const app = express();

// Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Attachments Static Directory
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/requests', requestRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Enterprise Workflow Automation API - Online'
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
async function startServer() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database Connected.');

    // Sync models
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      console.log('Database models synchronized.');

      // Initialize default roles
      const roles = [
        {
          id: 1,
          name: 'Employee',
          permissions: []
        },
        {
          id: 2,
          name: 'Manager',
          permissions: []
        },
        {
          id: 3,
          name: 'HR',
          permissions: []
        },
        {
          id: 4,
          name: 'Finance',
          permissions: []
        },
        {
          id: 5,
          name: 'Admin',
          permissions: []
        }
      ];

      for (const role of roles) {
        await Role.findOrCreate({
          where: {
            id: role.id
          },
          defaults: role
        });
      }

      console.log('Default roles initialized.');
    }

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Express Backend Server running on port ${PORT}`
      );
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Start execution
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
