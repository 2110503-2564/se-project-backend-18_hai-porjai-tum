const mongoose = require('mongoose');
const cron = require('node-cron');
const Car = require('../models/Car'); // Adjust the path to your Car model
const { isHighSeason } = require('../utils/isHighSeason');
const Rental = require('../models/Rental'); // Function to check high season

// Function to calculate demand factor for a car based on a specific date
const calculateDemandFactor = async (car, date, isHighSeasonDay) => {
    let demand = 1.0;
    const rentals = await mongoose.model('Rental').countDocuments({ car: car._id });
    const aDate = new Date(date);

    if (isHighSeasonDay) {
        demand += 0.5;
    }

    if (aDate.getDay() === 5 || aDate.getDay() === 6) {
        demand += 0.2;
    }

    if (rentals > 5) {
        demand += 0.3;
    }

    return demand;
};

// Function to calculate rental price for a given start date
const calculateRentalPrice = async (car, startDate) => {
    // console.log(startDate);
    const isHighSeasonDay = await isHighSeason(startDate);
    const demand = await calculateDemandFactor(car, startDate, isHighSeasonDay);
    return car.pricePerDay * demand;
};


const updateRentalPrices = async () => {
    try {
        const rentals = await Rental.find().populate('car');
        for (const rental of rentals) {
            if (rental.car) {
                rental.assumePrice = await calculateRentalPrice(rental.car, rental.startDate);
                await rental.save();
            }
        }
        console.log('Rental prices updated successfully');
    } catch (error) {
        console.error('Error updating rental prices:', error);
    }
};



module.exports = {
    updateRentalPrices,
    calculateDemandFactor,
    calculateRentalPrice
};