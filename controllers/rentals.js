const Rental = require('../models/Rental');
const Car = require('../models/Car');
const {calculateRentalPrice} = require('../utils/CarPriceUpdate');

//@desc     Get all rentals
//@route    GET /api/v1/rentals
//@access   Public
exports.getRentals = async (req, res, next) => {
    let query;
    //General users can see only their rentals!
    if(req.user.role !== 'admin') {
        query = Rental.find({user:req.user.id}).populate({
            path:'car',
            select: 'name model picture pricePerDay tel rating'
        }).populate({
            path: 'user',
            select: 'name role payment'
        }); 
    } else { //If youare an admin, you can see all!
        if(req.params.carId){
            query = Rental.find({ car: req.params.carId }).populate({
                path:'car',
                select: 'name model picture pricePerDay tel rating'
            }).populate({
                path: 'user',
                select: 'name role payment'
            });
        }else{
            query = Rental.find().populate({
                path:'car',
                select: 'name model picture pricePerDay tel rating'
            }).populate({
                path: 'user',
                select: 'name role payment'
            });
        }
        
    }
    try {
        const rentals = await query;

        res.status(200).json({
            success:true,
            count:rentals.length,
            data: rentals
        });
    } catch (error) {
        console (error);
        return res.status(500).json({success:false, message:"Cannot find Rental"});
    }
};

//@desc     Get single rental
//@route    GET /api/v1/rentals/:id
//@access   Public
exports.getRental = async (req, res, next) => {
    try {
        const rental = await Rental.findById(req.params.id).populate({
            path: 'car',
            select: 'name model picture description tel rating'
        }).populate({
            path: 'user',
            select: 'name role payment'
        });

        if(!rental){
            return res.status(404).json({success:false, message: `No appointment with the id of ${req.params.id}`}); 
        }

        res.status(200).json({
            success:true,
            data: rental
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot find Rental"});
    }
}

//@desc     Add rental
//@route    POST /api/v1/rentals/:rentalId/rental
//@access   Private
exports.addRental = async (req, res, next) => {
    try{
        //add user Id to req.body
        req.body.user = req.user.id;

        //Check for existed rental
        const existedRentals = await Rental.find({user:req.user.id});

        // console.log("---------------------------------");
        // console.log(existedRentals);
        // console.log(existedRentals.length);

        //If the user is not an admin, they can only create 3 rental.
        if(existedRentals.length >= 3 && req.user.role !== 'admin'){
            // console.log(2);
            return res.status(400).json({success:false, message:`The user with ID ${req.params.carId} has already made 3 rental`});
        }
        // console.log(1);

        req.body.car = req.params.carId;

        const car = await Car.findById(req.params.carId);

        if(!car){
            return res.status(404).json({success:false, message:`No car with the id of ${req.params.carId}`});
        }


        // Additional check if renting car is already reanted
        // let rentalInDate = await Rental.find({
        //         $or: [
        //           { startDate: { $lte: req.body.endDate, $gte: req.body.startDate } }, // Rental starts within the range
        //           { endDate: { $lte: req.body.endDate, $gte: req.body.startDate } },   // Rental ends within the range
        //           { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.endDate } } // Rental spans the entire range
        //         ], car:req.params.carId
        //   });

        // if(rentalInDate.length > 0){
        //     return res.status(404).json({success:false, message:`There is a rented car in this time slot`});
        // }
        //----------------------------

        // console.log(req.body.startDate);
        // const rentalPrice = await calculateRentalPrice(car, req.body.startDate);
        const startDate = new Date(req.body.pickupDate)
        const endDate = new Date(req.body.returnDate)
        const rentalPrice = ((endDate - startDate)/(1000 * 60 * 60 * 24) + 1) * car.pricePerDay

        const rental = await Rental.create({...req.body, assumePrice: rentalPrice});
        
        // const rental = await Rental.create(req.body);

        res.status(200).json({
            success: true,
            data: rental
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot create Rental"});
    }
}

//@desc     Upadate rental
//@route    PUT /api/v1/rentals/:id
//@access   Private
exports.updateRental = async (req, res, next) => {
    try{
        let rental = await Rental.findById(req.params.id);

        if(!rental){
            return res.status(404).json({success:false, message:`No Rental with the id of ${req.params.carId}`});
        }

        //Make sure user is the rental owner
        if(rental.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, message:`User ${req.params.carId} is not authorized to update this rental`});
        }

        // const car = await Car.findById(req.params.carId);

        // const rentalPrice = calculateRentalPrice(car, req.body.startDate);

        // rental = await Rental.findByIdAndUpdate(req.params.id, {...req.body, assumePrice: rentalPrice}, {
        //     new:true,
        //     runValidators:true
        // });
        
        const car = await Car.findById(rental.car);
        console.log(car)

        const startDate = new Date(req.body.pickupDate)
        const endDate = new Date(req.body.returnDate)
        const rentalPrice = ((endDate - startDate)/(1000 * 60 * 60 * 24) + 1) * car.pricePerDay
        req.body.assumePrice = rentalPrice

        rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            runValidators:true
        });
        res.status(200).json({
            success: true,
            data: rental
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message: 'Cannot update Rental'});
    }
}

//@desc     Delete rental
//@route    DELETE /api/v1/rentals/:id
//@access   Private
exports.deleteRental = async (req, res, next) => {
    try{
        let rental = await Rental.findById(req.params.id);

        if(!rental){
            return res.status(404).json({success:false, message:`No Rental with the id of ${req.params.carId}`});
        }

        //Make sure user is the rental owner
        if(rental.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, message:`User ${req.params.carId} is not authorized to update this rental`});
        }

        await rental.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message: 'Cannot delete Rental'});
    }
}