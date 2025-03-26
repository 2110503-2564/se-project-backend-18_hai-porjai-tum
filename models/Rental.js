const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
    pickupDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    returnLocation: {
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    car:{
        type: mongoose.Schema.ObjectId,
        ref: 'Car',
        required: true
    },
    assumePrice:{
        type: Number
    },
    createAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Rental', RentalSchema);