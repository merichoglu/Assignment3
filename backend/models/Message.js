const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  timestamp: {type: Date, default: Date.now},
  senderUsername: {type: String, required: true},
  receiverUsername: {type: String, required: true},
  title: {type: String},
  content: {type: String, required: true},
  senderDeleted: {type: Boolean, default: false},
  receiverDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Message', messageSchema);
