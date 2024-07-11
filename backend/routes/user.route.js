const express = require('express');
const userRoutes = express.Router();
const { verifyToken, verifyAdmin } = require('../utils/jwtUtil');
const User = require('../models/User');

// Get user access logs
userRoutes.get('/access-logs', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'username accessLogs');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with paging and sorting
userRoutes.route('/').get(verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'username';
    const order = req.query.order === 'asc' ? 1 : -1;

    const sortCriteria = { [sortBy]: order };

    const users = await User.find()
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalUsers = await User.countDocuments().exec();

    res.json({
      users,
      totalUsers,
      page,
      pages: Math.ceil(totalUsers / limit)
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

// Get user by username
userRoutes.route('/:username').get(verifyToken, async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Fetching user failed' });
  }
});

// Create a new user (Admin only)
userRoutes.route('/add').post(verifyToken, verifyAdmin, async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required' });
  }
  try {
    let user = new User(req.body);
    await user.save();
    res.status(200).json({ message: 'User added successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User already exists'})
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (Admin only)
userRoutes.put('/update/:username', verifyToken, verifyAdmin, async (req, res) => {
  const username = req.params.username;
  const updatedUser = req.body;

  try {
    const user = await User.findOneAndUpdate({ username }, updatedUser, { new: true });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send('Error updating user');
  }
});

// Delete user (Admin only)
userRoutes.route('/delete/:username').delete(verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = userRoutes;
