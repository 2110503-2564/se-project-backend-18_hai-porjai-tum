const { getRentals, getRental, addRental, updateRental, deleteRental } = require('../controllers/rentals');
const Rental = require('../models/Rental');
const Car = require('../models/Car');

// manually mock methods
Rental.find = jest.fn();
Rental.create = jest.fn();
Rental.findById = jest.fn();
Rental.findByIdAndUpdate = jest.fn();
Car.findById = jest.fn();

function createMockQuery(resolvedData) {
    const exec = jest.fn().mockResolvedValue(resolvedData);
    const populate = jest.fn(() => ({ populate, exec }));
    return { populate };
}


describe('Rental Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { id: 'id' }, body: {}, user: { id: 'userId', role: 'user' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();

        // Clear previous mocks
        Rental.find.mockReset();
        Rental.create.mockReset();
        Rental.findById.mockReset();
        Rental.findByIdAndUpdate.mockReset();
        Car.findById.mockReset();
    });


    // getRentals
    describe('getRentals', () => {
        it('should return rentals for admin', async () => {
            req.user.role = 'admin';
            Rental.find.mockReturnValue(createMockQuery([{ id: 'rental1' }, { id: 'rental2' }]));

            await getRentals(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
        it('query with carId should return rentals for admin', async () => {
            req.user.role = 'admin';
            req.params.carId="carId"
            Rental.find.mockReturnValue(createMockQuery([{ id: 'rental1' }, { id: 'rental2' }]));

            await getRentals(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should return rentals for user', async () => {
            Rental.find.mockReturnValue(createMockQuery([{ id: 'rental1' }]));

            await getRentals(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
        it('should return 500 if there is a server error', async () => {
            //req.params.role="user";
            Rental.find.mockImplementation(() => {
                throw new Error('error');
            });

            await getRentals(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot find Rental'
            });
        });
    });

    // getRental
    describe('getRental', () => {
        it('should return rental if found', async () => {
            const mockedRental = {
                _id: 'rental123',
                car: { name: 'Car 1' },
                user: { name: 'User 1' }
            };

           
            Rental.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockResolvedValue(mockedRental)
                })
              });
          

            await getRental(req, res, next);

            expect(Rental.findById).toHaveBeenCalledWith('id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockedRental
              });
        });

        it('should return 404 if rental not found', async () => {
            Rental.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockResolvedValue(null)
                })
              });
          
            req.params.id="not found Id"
            await getRental(req, res, next);

            expect(Rental.findById).toHaveBeenCalledWith('not found Id');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: `No appointment with the id of not found Id`
            });
        });


        it('should handle server errors', async () => {
            Rental.findById.mockImplementation(() => { throw new Error('DB error'); });

            await getRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });
    });

    // addRental
    describe('addRental', () => {
        it('should create a rental successfully', async () => {
            req.params.carId = 'carId';
            Car.findById.mockResolvedValue({ pricePerDay: 100 });
            Rental.find.mockResolvedValue([]);
            Rental.create.mockResolvedValue({ id: 1 });

            req.body.pickupDate = "2024-04-01";
            req.body.returnDate = "2024-04-05";

            await addRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should return 404 if car not found', async () => {
            req.params.carId = 'not found id';
            Rental.find.mockReturnValue(createMockQuery([{ id: 'rental1' }]));
            Car.findById.mockResolvedValue(null);
            
            await addRental(req, res, next);

            expect(Car.findById).toHaveBeenCalledWith('not found id');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: `No car with the id of not found id`
            });
        });

        it('should prevent more than 3 rentals for normal user', async () => {
            Rental.find.mockResolvedValue([{}, {}, {}]);
            req.params.carId = 'carId';

            await addRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });

        it('should handle server errors', async () => {
            Rental.find.mockRejectedValue(new Error('DB error'));

            await addRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });
    });

    // updateRental
    describe('updateRental', () => {
        it('should update rental if owner', async () => {
            req.params.id = 'rentalId';
            req.body.pickupDate = "2024-04-01";
            req.body.returnDate = "2024-04-05";

            Rental.findById.mockResolvedValue({ user: 'userId', car: 'carId' });
            Car.findById.mockResolvedValue({ pricePerDay: 100 });
            Rental.findByIdAndUpdate.mockResolvedValue({ id: 1 });

            await updateRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should prevent unauthorized user update', async () => {
            Rental.findById.mockResolvedValue({ user: 'anotherUserId', car: 'carId' });

            await updateRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });

        it('should handle rental not found', async () => {
            Rental.findById.mockResolvedValue(null);

            await updateRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });
        it('should return 500 if there is a server error', async () => {
            Rental.findById.mockImplementation(() => {
                throw new Error('Database error');
            });

            await updateRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot update Rental'
            });
        });
    });

    // deleteRental
    describe('deleteRental', () => {
        it('should delete rental if owner', async () => {
            const deleteMock = jest.fn();
            Rental.findById.mockResolvedValue({ user: 'userId', deleteOne: deleteMock });

            req.params.id = 'rentalId';
            await deleteRental(req, res, next);

            expect(deleteMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should prevent unauthorized delete', async () => {
            Rental.findById.mockResolvedValue({ user: 'anotherUserId' });

            await deleteRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });

        it('should handle rental not found', async () => {
            Rental.findById.mockResolvedValue(null);

            await deleteRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });
        it('should return 500 if there is a server error', async () => {
            Rental.findById.mockImplementation(() => {
                throw new Error('Database error');
            });

            await deleteRental(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot delete Rental'
            });
        });
    });

});
