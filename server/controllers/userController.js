const User = require('../models/User');
const bcrypt = require('bcrypt');

// Toggle driver availability
exports.toggleAvailability = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.type !== 'driver') {
            return res.status(403).json({ error: 'Only drivers can toggle availability' });
        }

        // Toggle between available and unavailable
        const newStatus = user.availability_status === 'available'
            ? 'unavailable'
            : 'available';

        user.availability_status = newStatus;
        await user.save();

        res.json({
            message: 'Availability updated',
            status: newStatus
        });
    } catch (err) {
        console.error('Toggle availability error:', err);
        res.status(500).json({ error: 'Failed to update availability' });
    }
};

// Get current user availability
exports.getAvailability = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['availability_status']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ status: user.availability_status });
    } catch (err) {
        console.error('Get availability error:', err);
        res.status(500).json({ error: 'Failed to get availability' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password, city } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (city) user.city = city;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        // Return user without password
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
