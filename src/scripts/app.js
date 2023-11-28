const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const User = require('./models/User');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/jobs', require('./routes/jobRoutes'));

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
