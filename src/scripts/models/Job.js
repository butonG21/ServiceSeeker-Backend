const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  startDate: { type: Date, required: true, validate: { validator: validateStartDate } },
  endDate: { type: Date, default: null },
  address: { type: String, required: true },
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
  createdBy: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Process', 'Finish'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

jobSchema.index({ location: '2dsphere' });

// Validasi untuk memastikan startDate tidak kurang dari tanggal saat ini
function validateStartDate(value) {
  const currentDate = new Date();
  return value >= currentDate;
}

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
