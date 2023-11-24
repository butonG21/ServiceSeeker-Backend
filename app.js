// app.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const User = require('./models/User');
const Job = require('./models/Job');
const authenticateToken = require('./middleware/authenticateToken');

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

// Rute Auth
app.use('/auth', authRoutes);

// Rute Pekerjaan memerlukan otentikasi
app.use('/jobs', authenticateToken, jobRoutes);

// rute untuk mendapatkan pengguna dan pekerjaan
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get('/all-jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
