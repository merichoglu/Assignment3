const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
