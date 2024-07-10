const express = require('express');
const messageRoutes = express.Router();
const { verifyToken, verifyAdmin } = require('../utils/jwtUtil');

// Require Message model
let Message = require('../models/Message');

// Require User model
let User = require("../models/User");

// Create a new message
messageRoutes.route('/send').post(verifyToken, async (req, res) => {
  try {
    const { receiverUsername } = req.body;
    // Check if receiver exists
    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) {
      return res.status(400).json({ error: 'Receiver not found' });
    }

    let message = new Message(req.body);
    await message.save();
    res.status(200).json({ 'message': 'Message sent successfully' });
  } catch (err) {
    res.status(400).send('Error sending message');
  }
});

// Get all messages (for debugging purpose)
messageRoutes.route('/').get(verifyToken, async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get inbox messages
messageRoutes.route('/inbox').get(verifyToken, async (req, res) => {
  try {
    const { sortBy = 'timestamp', sortDirection = 'asc', searchQuery = '' } = req.query;
    const sort = {};
    sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
    const query = {
      receiverUsername: req.user.username,
      $or: [
        { senderUsername: { $regex: searchQuery, $options: 'i' } },
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } }
      ]
    };
    const messages = await Message.find(query).sort(sort).exec();
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

messageRoutes.route('/outbox').get(verifyToken, async (req, res) => {
  try {
    const { sortBy = 'timestamp', sortDirection = 'asc', searchQuery = '' } = req.query;
    const sort = {};
    sort[sortBy] = sortDirection === 'asc' ? 1 : -1;
    const query = {
      senderUsername: req.user.username,
      $or: [
        { receiverUsername: { $regex: searchQuery, $options: 'i' } },
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } }
      ]
    };
    const messages = await Message.find(query).sort(sort).exec();
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// Get messages by sender username
messageRoutes.route('/sent/:username').get(verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ senderUsername: req.params.username });
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get messages by receiver username
messageRoutes.route('/received/:username').get(verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ receiverUsername: req.params.username });
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Delete message (Admin only)
messageRoutes.route('/delete/:id').delete(verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json('Message deleted');
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = messageRoutes;
