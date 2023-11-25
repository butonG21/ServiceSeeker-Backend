const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  fullName: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, validate: /^\d+$/ },
  role: { type: String, enum: ['employer', 'job_seeker'], required: true },
  password: { type: String, required: true },
  address: { type: String, maxlength: 255 },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
