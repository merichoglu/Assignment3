const jwt = require('jsonwebtoken');
const secret = 'ilovesrdc';

const generateToken = (user) => {
  return jwt.sign({ username: user.username, isAdmin: user.isAdmin }, secret, { expiresIn: '1h' });
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token.split(' ')[1], secret, (err, decoded) => {
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
