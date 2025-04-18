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
