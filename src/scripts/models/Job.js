const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
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
  TakenBY: { type: mongoose.Schema.Types.String, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
      // Validasi hanya jika endDate dan createdAt ada nilainya
        if (value && this.createdAt) {
          return value > this.createdAt;
        }
        // Jika endDate atau createdAt kosong, validasi dianggap berhasil
        return true;
      },
      message: 'End date must be greater than the creation date.',
    },
  },
  updatedAt: { type: Date, default: null },
});

jobSchema.index({ location: '2dsphere' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
