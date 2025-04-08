//@desc     Update current logged in user
//@route    PUT /api/v1/users/update
//@access   Private
const User = require('../models/User');

exports.updateUser = async (req, res, next) => {
    try {
        // Prevent changes to sensitive fields
        if (req.body.password || req.body.email) {
            return res.status(400).json({
                success: false,
                error: "You cannot update email or password from this route"
            });
        }

        const userId = req.user.id; // Comes from protect middleware

        const user = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true
        });

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
