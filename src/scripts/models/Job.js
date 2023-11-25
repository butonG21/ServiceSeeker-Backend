const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  duration: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  employer: { type: String, required: true },
  status: { type: String, default: 'Open' },
});

jobSchema.index({ location: '2dsphere' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
