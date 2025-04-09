const mongoose = require('mongoose');


const CarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    model: {
        type: String,
        required: [true, 'Please add a model'],
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    tel: {
        type: String
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Please add a price rate']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    demandFactor: {
        type: Number,
        default: 1.0 
    },
    picture: {
        type: String,
        required: [true, 'Please add a picture']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5'],
        set: value => value ? Math.round(value * 10) / 10 : undefined
    },
    tier: {
        type: String,
        enum: ['Bronze', 'Diamond', 'Gold', 'Platinum', 'Silver'],
        default: 'Bronze'
    }

    
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to calculate average rating (ทศนิยม 1 ตำแหน่ง)
CarSchema.virtual('averageRating').get(function () {
    if (!this.reviews || this.reviews.length === 0) {
        return 0;
    }
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10; // ปัดเศษให้เป็นทศนิยม 1 ตำแหน่ง
});






// Reverse populate with virtuals
CarSchema.virtual('rentals', {
    ref: 'Rental',
    localField: '_id',
    foreignField: 'car',
    justOne: false
});

module.exports = mongoose.model('Car', CarSchema);