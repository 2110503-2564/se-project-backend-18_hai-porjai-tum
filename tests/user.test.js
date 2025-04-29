jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'mockUserId', role: 'admin' }; // Simulate authenticated user
    next();
  },
  authorize: () => (req, res, next) => next()  // Skip role check
}));

const request = require('supertest');
const app = require('../app');  // Assuming this is where your Express app is initialized
const User = require('../models/User');

// Mock the User model's methods for testing
jest.mock('../models/User');

// Tests for `updateUserPayment`
describe('PUT /api/v1/update', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should update user payment correctly', async () => {
        const mockUser = { id: '1', payment: 100 };

        // Mock the User.findByIdAndUpdate method
        User.findByIdAndUpdate.mockResolvedValue({ ...mockUser, payment: 150 });

        const res = await request(app)
            .put('/api/v1/update')
            .set('Authorization', 'Bearer token') // Mock the token for authentication
            .send({ payment: 50 });  // Test increasing payment by 50
        expect(res.body.data.payment).toBe(150);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
          // Check if payment is incremented
    });

    it('should return an error if payment is not a number', async () => {
        const res = await request(app)
            .put('/api/v1/update')
            .set('Authorization', 'Bearer token')
            .send({ payment: 'invalid' });  // Test invalid payment

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('You must provide a valid payment amount');
    });
    it('should return an error if there is a server error', async () => {
        User.findByIdAndUpdate.mockImplementation(() => {
            throw new Error('Database error');
        });
        const res = await request(app)
            .put('/api/v1/update')
            .set('Authorization', 'Bearer token')
            .send({ payment: 100 });  // Test invalid payment

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Something went wrong');
    });

    it('should return an error if user is not found', async () => {
        User.findByIdAndUpdate.mockResolvedValue(null);  // Simulate user not found

        const res = await request(app)
            .put('/api/v1/update')
            .set('Authorization', 'Bearer token')
            .send({ payment: 50 });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('User not found');
    });
});

// Tests for `setUserPayment`
describe('PUT /api/v1/:id/setpayment', () => {
    it('should set user payment correctly', async () => {
        const mockUser = { id: '1', payment: 100 };

        User.findByIdAndUpdate.mockResolvedValue({ ...mockUser, payment: 200 });

        const res = await request(app)
            .post('/api/v1/1/setpayment')
            .set('Authorization', 'Bearer token')
            .send({ payment: 200 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.payment).toBe(200);
    });

    it('should return an error if user is not found', async () => {
        User.findByIdAndUpdate.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/v1/1/setpayment')
            .set('Authorization', 'Bearer token')
            .send({ payment: 200 });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('User not found');
    });
    it('should return an error if there is a server error', async () => {
        User.findByIdAndUpdate.mockImplementation(() => {
            throw new Error('Database error');
        });
        const res = await request(app)
            .post('/api/v1/1/setpayment')
            .set('Authorization', 'Bearer token')
            .send({ payment: 100 });  // Test invalid payment

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Something went wrong');
    });
});

// Tests for `getUsers`
describe('GET /api/v1/users', () => {
    it('should return all users', async () => {
        const mockUsers = [{ id: '1', name: 'User1' }, { id: '2', name: 'User2' }];
        User.find.mockResolvedValue(mockUsers);

        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2);
    });

    it('should handle server error', async () => {
        User.find.mockRejectedValue(new Error('Server Error'));

        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Server Error');
    });
});
