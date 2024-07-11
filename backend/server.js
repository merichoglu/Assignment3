const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user.route');
const messageRoutes = require('./routes/message.route');
const authRoutes = require('./routes/auth.route'); // Import authRoutes

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/hw3', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

app.use('/auth', authRoutes); // Register authRoutes
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);

module.exports = app;
