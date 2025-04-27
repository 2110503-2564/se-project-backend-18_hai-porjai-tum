//@desc     Update current logged in user's payment
//@route    PUT /api/v1/users/updatePayment
//@access   Private
const User = require('../models/User');

exports.updateUserPayment = async (req, res, next) => {
    try {
        // Ensure that payment data is provided in the request body
        if (typeof req.body.payment !== 'number') {
            return res.status(400).json({
                success: false,
                error: "You must provide a valid payment amount"
            });
        }

        const userId = req.user.id; // Comes from the protect middleware

        // Find user by ID and update their payment (increment current payment)
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { payment: req.body.payment } }, // Increment current payment by the value in the request body
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }
};

exports.setUserPayment = async (req, res, next) => {
    try {
        const { id } = req.params; // Get the user ID from the route parameter
        const { payment } = req.body; // Get the payment value from the body

        // Find user by ID and set their payment
        const user = await User.findByIdAndUpdate(
            id,  // Use the user ID from the route parameter
            { payment },  // Update the payment field
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }
};



exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
