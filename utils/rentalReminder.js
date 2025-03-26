const Rental = require('../models/Rental');
const User = require('../models/User');
const sendEmail = require('./sendRentalNotification');

const sendRentalReminders = async () => {
    try {
        
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Find rentals that start today
        const rentals = await Rental.find({
                    startDate: { $gte: startOfDay, $lte: endOfDay }
                  }).populate('user car');

        for (const rental of rentals) {
            if (!rental.user || !rental.user.email) continue; // Skip if no user email

            const message = `Hello ${rental.user.name},\n\nYour rental for the car "${rental.car.name}" starts today.\n\nEnjoy your ride!\n\nBest regards,\n CarRental350 Service`;

            await sendEmail({
                email: rental.user.email,
                subject: 'Rental Reminder: Your Car Rental Starts Today',
                message
            });

            console.log(`Reminder sent to ${rental.user.email}`);
        }
    } catch (error) {
        console.error('Error sending rental reminders:', error);
    }
};

module.exports = sendRentalReminders;
