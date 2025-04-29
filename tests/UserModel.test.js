const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany();
});

describe('User Model', () => {
    it('should create a user with required fields', async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        expect(user.name).toBe('Test User');
        expect(user.email).toBe('test@example.com');
        expect(user.role).toBe('user');
        expect(user.payment).toBe(0);
    });

    it('should encrypt password before saving', async () => {
        const plainPassword = 'password123';
        const user = await User.create({
            name: 'Encrypt User',
            email: 'encrypt@example.com',
            password: plainPassword
        });

        expect(user.password).not.toBe(plainPassword); // Password must be hashed
        const isMatch = await bcrypt.compare(plainPassword, user.password);
        expect(isMatch).toBe(true);
    });

    it('should generate a signed JWT token', async () => {
        process.env.JWT_SECRET = 'testsecret';
        process.env.JWT_EXPIRE = '1h';

        const user = await User.create({
            name: 'JWT User',
            email: 'jwt@example.com',
            password: 'password123'
        });

        const token = user.getSignedJwtToken();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.id).toEqual(user._id.toString());
    });

    it('should match user entered password with hashed password', async () => {
        const password = 'password123';
        const user = await User.create({
            name: 'Match Password User',
            email: 'match@example.com',
            password
        });

        const isMatch = await user.matchPassword(password);
        expect(isMatch).toBe(true);

        const isNotMatch = await user.matchPassword('wrongpassword');
        expect(isNotMatch).toBe(false);
    });

    it('should require name, email, and password', async () => {
        const user = new User();
        let err;
        try {
            await user.validate();
        } catch (error) {
            err = error;
        }
        expect(err.errors.name).toBeDefined();
        expect(err.errors.email).toBeDefined();
        expect(err.errors.password).toBeDefined();
    });

    it('should require valid email format', async () => {
        const user = new User({
            name: 'Invalid Email User',
            email: 'invalidemail',
            password: 'password123'
        });

        let err;
        try {
            await user.validate();
        } catch (error) {
            err = error;
        }
        expect(err.errors.email).toBeDefined();
        expect(err.errors.email.message).toBe('Please add a valid email');
    });
});
