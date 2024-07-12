const express = require('express');
const userRoutes = express.Router();
const {verifyToken, verifyAdmin} = require('../utils/jwtUtil');
const User = require('../models/User');
const Message = require('../models/Message');

// Get user access logs with sorting and pagination
userRoutes.get('/access-logs', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'accessLogs.loginTime';
    const order = req.query.order === 'asc' ? 1 : -1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || '';

    const matchStage = filter ? {
      $match: {
        $or: [
          {"username": {$regex: filter, $options: 'i'}},
          {"accessLogs.ip": {$regex: filter, $options: 'i'}},
          {"accessLogs.browser": {$regex: filter, $options: 'i'}}
        ]
      }
    } : {};

    const pipeline = [
      {$unwind: "$accessLogs"},
      ...(filter ? [matchStage] : []),
      {
        $sort: {
          [sortBy]: order
        }
      },
      {$skip: skip},
      {$limit: limit},
      {
        $group: {
          _id: "$_id",
          username: {$first: "$username"},
          accessLogs: {$push: "$accessLogs"}
        }
      },
      {
        $sort: {
          [sortBy]: order
        }
      }
    ];

    const users = await User.aggregate(pipeline);

    const totalLogsPipeline = [
      {$unwind: "$accessLogs"},
      ...(filter ? [matchStage] : []),
      {$count: "total"}
    ];
    const totalLogs = await User.aggregate(totalLogsPipeline);

    res.json({users, totalLogs: totalLogs[0] ? totalLogs[0].total : 0});
  } catch (err) {
    console.error("Error fetching access logs:", err);
    res.status(500).json({message: 'Server error'});
  }
});

// Get all users with paging and sorting
userRoutes.route('/').get(verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'username';
    const order = req.query.order === 'asc' ? 1 : -1;

    const sortCriteria = {[sortBy]: order};

    const users = await User.find()
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('username name surname email gender location')
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

// Typeahead route to get user list, no admin privilege
userRoutes.get('/typeahead', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'username').limit(10).exec();
    res.json(users);
  } catch (err) {
    res.status(500).json({message: 'Server error'});
  }
});

// Get user by username
userRoutes.route('/:username').get(verifyToken, async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({username: username}).select('-password');
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({message: 'Fetching user failed'});
  }
});

// Create a new user (Admin only)
userRoutes.route('/add').post(verifyToken, verifyAdmin, async (req, res) => {
  const {username, password, email} = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({message: 'Username, password, and email are required'});
  }
  try {
    let user = new User(req.body);
    await user.save();
    res.status(200).json({message: 'User added successfully'});
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({message: 'User already exists'})
    }
    res.status(500).json({message: 'Internal server error'});
  }
});

// Update user (Admin only)
userRoutes.put('/update/:username', verifyToken, verifyAdmin, async (req, res) => {
  const username = req.params.username;
  const updatedUser = { ...req.body };

  // If password is not provided, delete it from the update object
  if (!updatedUser.password) {
    delete updatedUser.password;
  }

  try {
    const user = await User.findOneAndUpdate({ username }, updatedUser, { new: true }).select('-password');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).send('Error updating user');
  }
});


// Delete user (Admin only)
userRoutes.route('/delete/:username').delete(verifyToken, verifyAdmin, async (req, res) => {
  try {
    const username = req.params.username;

    // Delete the user
    const user = await User.findOneAndDelete({username});
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Update related messages
    await Message.updateMany({senderUsername: username}, {$set: {senderUsername: null}});
    await Message.updateMany({receiverUsername: username}, {$set: {receiverUsername: null}});

    res.json({message: 'User and related messages updated successfully'});
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({message: 'Server error'});
  }
});


module.exports = userRoutes;
