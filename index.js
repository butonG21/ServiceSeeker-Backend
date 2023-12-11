const express = require('express');
const cors = require('cors');
const connectDB = require('./src/scripts/config/db');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./src/scripts/routes/authRoutes'));
app.use('/jobs', require('./src/scripts/routes/jobRoutes'));
app.use('/reviews', require('./src/scripts/routes/reviewRoutes'));

app.use('/users', require('./src/scripts/routes/userRoutes'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
