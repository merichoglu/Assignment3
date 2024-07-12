const express = require('express');
const messageRoutes = express.Router();
const {verifyToken, verifyAdmin} = require('../utils/jwtUtil');

// Require Message model
let Message = require('../models/Message');

// Require User model
let User = require("../models/User");

// Create a new message
messageRoutes.route('/send').post(verifyToken, async (req, res) => {
  try {
    const {receiverUsername, title, content} = req.body;

    if (!receiverUsername || !title || !content) {
      return res.status(400).json({error: 'Receiver, title, and content are required'});
    }

    const receiver = await User.findOne({username: receiverUsername});

    if (!receiver) {
      return res.status(409).json({error: 'Receiver not found'});
    }

    let message = new Message(req.body);
    await message.save();
    res.status(200).json({message: 'Message sent successfully'});
  } catch (err) {
    res.status(409).send('Receiver not found.');
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
    const sortBy = req.query.sortBy || 'timestamp';
    const order = req.query.order === 'asc' ? 1 : -1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.searchQuery ? req.query.searchQuery.toLowerCase() : '';

    const query = { receiverUsername: req.user.username, receiverDeleted: false };
    if (searchQuery) {
      query.$or = [
        { senderUsername: new RegExp(searchQuery, 'i') },
        { title: new RegExp(searchQuery, 'i') },
        { content: new RegExp(searchQuery, 'i') }
      ];
    }

    const messages = await Message.find(query)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const totalMessages = await Message.countDocuments(query);

    res.json({ messages, totalMessages });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// Get outbox messages
messageRoutes.route('/outbox').get(verifyToken, async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'timestamp';
    const order = req.query.order === 'asc' ? 1 : -1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.searchQuery ? req.query.searchQuery.toLowerCase() : '';

    const query = { senderUsername: req.user.username, senderDeleted: false };
    if (searchQuery) {
      query.$or = [
        { receiverUsername: new RegExp(searchQuery, 'i') },
        { title: new RegExp(searchQuery, 'i') },
        { content: new RegExp(searchQuery, 'i') }
      ];
    }

    const messages = await Message.find(query)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const totalMessages = await Message.countDocuments(query);

    res.json({ messages, totalMessages });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// Delete message (logical deletion)
messageRoutes.route('/delete/:id').delete(verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiverUsername === user.username) {
      message.receiverDeleted = true;
    }

    if (message.senderUsername === user.username) {
      message.senderDeleted = true;
    }

    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// Get messages by sender username
messageRoutes.route('/sent/:username').get(verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({senderUsername: req.params.username});
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Get messages by receiver username
messageRoutes.route('/received/:username').get(verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({receiverUsername: req.params.username});
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
