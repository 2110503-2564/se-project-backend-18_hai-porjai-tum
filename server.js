const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require("hpp");

const app = require('./app');

const cron = require('node-cron');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');


//Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express Car Rental API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ],
        components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
              }
            }
        },
        security: [
            { bearerAuth: [] }
        ]
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Route file
const cars = require('./routes/cars');
const rentals = require('./routes/rentals');
const auth = require('./routes/auth');
const user = require('./routes/users')

app.use(cors());

//Utils
const sendRentalReminders = require('./utils/rentalReminder');

//add Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());
//
app.use(express.urlencoded({ extended: true }));

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
});
app.use(limiter);
app.use(hpp());





cron.schedule('0 8 * * *', () => {
    console.log('Running rental reminders...');
    sendRentalReminders();
});
// checks every  8 am



//Mount routers
app.use('/api/v1/cars', cars);
app.use('/api/v1/rentals', rentals);
app.use('/api/v1/auth', auth);
app.use('/api/v1/', user);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, 'module on port ', PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exist process
    server.close(() => process.exit(1));
});