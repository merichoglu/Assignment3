const express = require('express');
const router = express.Router();
const { generateToken, verifyToken} = require('../utils/jwtUtil');
const User = require('../models/User');
const requestIp = require('request-ip');
const useragent = require('useragent');

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(user);

    // Log the login event
    const clientIp = requestIp.getClientIp(req);
    const agent = useragent.parse(req.headers['user-agent']);
    const log = {
      loginTime: new Date(),
      ip: clientIp,
      browser: agent.toString()
    };
    user.accessLogs.push(log);
    await user.save();

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const latestLog = user.accessLogs[user.accessLogs.length - 1];
    if (latestLog && !latestLog.logoutTime) {
      latestLog.logoutTime = new Date();
    }

    await user.save();

    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
