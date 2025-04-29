
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount your routes
app.use('/api/v1/', userRoutes);

module.exports = app;
