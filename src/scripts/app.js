const { join } = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(express.static(join(__dirname, '../../docs')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../../docs', 'index.html'));
});

app.get('/README.md', (req, res) => {
  res.sendFile(join(__dirname, '../../docs', 'README.md'));
});
app.use('/auth', require('./routes/authRoutes'));
app.use('/jobs', require('./routes/jobRoutes'));
app.use('/reviews', require('./routes/reviewRoutes'));

app.use('/users', require('./routes/userRoutes'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
