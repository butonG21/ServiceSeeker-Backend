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
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/di4pghhmp/image/upload/v1701933301/profile-images/blank-profile-picture-973460_640_diudeh.png', // Set the default value to an empty string
  },
  createdAt: { type: Date, default: Date.now },

});

// Menambahkan transform option untuk menyembunyikan field password dari hasil JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    const modifiedRet = { ...ret };
    delete modifiedRet.password;
    return modifiedRet;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
