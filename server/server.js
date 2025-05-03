const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Debug middleware - log all requests BEFORE CORS
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  next();
});

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Debug middleware - log after CORS
app.use((req, res, next) => {
  console.log('\n=== Processing Request ===');
  console.log('Path:', req.path);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Test routes with detailed response
app.get('/', (req, res) => {
  console.log('Handling root request');
  res.json({ 
    message: 'Server is running',
    time: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  console.log('Handling test request');
  res.json({ 
    message: 'Test endpoint is working',
    time: new Date().toISOString()
  });
});

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://jacobalsg:Ncwko0yYyO8WotI7@todocluster0.ktjj4fn.mongodb.net/?retryWrites=true&w=majority&appName=ToDoCluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import routes
const todoRoutes = require('./routes/todos');
const projectRoutes = require('./routes/projects');

// API routes
app.use('/api/todos', todoRoutes);
app.use('/api/projects', projectRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n=== Error ===');
  console.error('Error details:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message,
    time: new Date().toISOString()
  });
});

// Handle 404s
app.use((req, res) => {
  console.log('\n=== 404 Not Found ===');
  console.log('Path:', req.path);
  res.status(404).json({ 
    message: 'Not Found',
    path: req.path,
    time: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Start server on localhost
app.listen(PORT, 'localhost', () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('\nAvailable routes:');
  console.log('- GET  /');
  console.log('- GET  /test');
  console.log('- GET  /api/todos');
  console.log('- POST /api/todos');
});
