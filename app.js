const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');

const indexRouter = require('./routes/index');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve uploaded files only under /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount main API router
app.use('/api', indexRouter);

// If someone opens port 3000 in the browser, show API info instead of Express default page
app.get('/', (req, res) => {
  res.status(404).json({ message: 'StudentWell API server. Access the frontend app at http://localhost:5173/' });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
