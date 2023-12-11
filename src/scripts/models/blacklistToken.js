const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
});

const BlacklistToken = mongoose.model('BlacklistToken', blacklistTokenSchema);

module.exports = BlacklistToken;
