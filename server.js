const express = require('express');
const http = require('http'); // ✅ Required to create HTTP server
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { Server } = require('socket.io'); // ✅ Socket.IO

const cron = require('node-cron');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const cars = require('./routes/cars');
const rentals = require('./routes/rentals');
const auth = require('./routes/auth');
const user = require('./routes/users');

const app = express();
const server = http.createServer(app); // ✅ Create server manually

// Allow frontend from port 3000 (dev)
app.use(cors({
  origin: process.env.FONTEND_URL,
  methods: ['GET', 'POST']
}));

// ✅ Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// ✅ Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Utils
const sendRentalReminders = require('./utils/rentalReminder');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Prevent HTTP parameter pollution
app.use(hpp());

// Schedule rental reminders
cron.schedule('0 8 * * *', () => {
  console.log('Running rental reminders...');
  sendRentalReminders();
});

// Mount routers
app.use('/api/v1/cars', cars);
app.use('/api/v1/rentals', rentals);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', user);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
