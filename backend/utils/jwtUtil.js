const jwt = require('jsonwebtoken');
const secret = 'ilovesrdc';
const Blacklist = require('../models/Blacklist');

const generateToken = (user) => {
  return jwt.sign({username: user.username, isAdmin: user.isAdmin}, secret, {expiresIn: '1h'});
};

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  const actualToken = token.split(' ')[1];

  // Check if token is blacklisted
  const blacklisted = await Blacklist.findOne({token: actualToken});
  if (blacklisted) {
    return res.status(401).send('Token is blacklisted');
  }

  jwt.verify(actualToken, secret, (err, decoded) => {
    if (err) return res.status(401).send('Invalid token');
    req.user = decoded;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).send('Admin privileges required');
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  verifyAdmin
};
