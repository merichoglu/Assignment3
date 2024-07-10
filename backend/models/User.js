const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
  ip: { type: String },
  browser: { type: String }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  name: { type: String },
  surname: { type: String },
  birthdate: { type: Date },
  email: { type: String },
  gender: { type: String },
  location: { type: String },
  isAdmin: { type: Boolean, default: false },
  sentMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  accessLogs: [accessLogSchema]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);
