const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  duration: { type: String, required: true },
  location: { type: String, required: true },
  employer: { type: String, required: true },
  status: { type: String, default: 'Open' },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
