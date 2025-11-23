const Ride = require('../models/Ride');
const User = require('../models/User');
const { getIO } = require('../config/socket');

// Request a new ride (Passenger)
exports.requestRide = async (req, res) => {
    const { pickup_location, drop_location, ride_type } = req.body;
    const passenger_id = req.user.id;

    try {
        const ride = await Ride.create({
            pickup_location,
            drop_location,
            ride_type,
            passenger_id
        });

        // Fetch full ride data with passenger info
        const fullRide = await Ride.findByPk(ride.id, {
            include: ['Passenger']
        });

        // Emit to all drivers that a new ride is available
        const io = getIO();
        io.to('drivers').emit('ride:created', fullRide);

        res.status(201).json(fullRide);
    } catch (err) {
        console.error('Request ride error:', err);
        res.status(500).json({ error: 'Ride request failed', details: err.message });
    }
};

// Get all rides for current user (passenger or driver)
exports.getMyRides = async (req, res) => {
    try {
        const whereClause = {};
        if (req.user.type === 'passenger') {
            whereClause.passenger_id = req.user.id;
        } else if (req.user.type === 'driver') {
            whereClause.driver_id = req.user.id;
        }

        const rides = await Ride.findAll({
            where: whereClause,
            include: ['Driver', 'Passenger'],
            order: [['createdAt', 'DESC']]
        });
        res.json(rides);
    } catch (err) {
        console.error('Get my rides error:', err);
        res.status(500).json({ error: 'Error fetching rides' });
    }
};

// Get a specific ride by ID
exports.getRideById = async (req, res) => {
    try {
        const ride = await Ride.findByPk(req.params.id, {
            include: ['Driver', 'Passenger']
        });

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        // Check if user is authorized to view this ride
        if (req.user.type === 'passenger' && ride.passenger_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to view this ride' });
        }
        if (req.user.type === 'driver' && ride.driver_id && ride.driver_id !== req.user.id) {
            // Allow drivers to view requested rides (to accept them) or their own rides
            if (ride.status !== 'requested') {
                return res.status(403).json({ error: 'Not authorized to view this ride' });
            }
        }

        res.json(ride);
    } catch (err) {
        console.error('Get ride error:', err);
        res.status(500).json({ error: 'Error retrieving ride' });
    }
};

// Get available rides (Driver)
exports.getAvailableRides = async (req, res) => {
    try {
        const rides = await Ride.findAll({
            where: { status: 'requested' },
            include: ['Passenger'],
            order: [['createdAt', 'DESC']]
        });
        res.json(rides);
    } catch (err) {
        console.error('Get available rides error:', err);
        res.status(500).json({ error: 'Error fetching available rides' });
    }
};

// Accept a ride (Driver)
exports.acceptRide = async (req, res) => {
    try {
        const ride = await Ride.findByPk(req.params.id, {
            include: ['Passenger']
        });

        if (!ride || ride.status !== 'requested') {
            return res.status(400).json({ error: 'Ride not available' });
        }

        ride.driver_id = req.user.id;
        ride.status = 'accepted';
        await ride.save();

        // Fetch updated ride with driver info
        const updatedRide = await Ride.findByPk(ride.id, {
            include: ['Driver', 'Passenger']
        });

        // Emit to passenger and all drivers
        const io = getIO();
        io.to(`user:${ride.passenger_id}`).emit('ride:accepted', updatedRide);
        io.to('drivers').emit('ride:updated', updatedRide);

        res.json({ message: 'Ride accepted', ride: updatedRide });
    } catch (err) {
        console.error('Accept ride error:', err);
        res.status(500).json({ error: 'Failed to accept ride' });
    }
};

// Reject a ride (Driver)
exports.rejectRide = async (req, res) => {
    try {
        const ride = await Ride.findByPk(req.params.id);

        if (!ride || ride.status !== 'requested') {
            return res.status(400).json({ error: 'Ride not available' });
        }

        ride.status = 'rejected';
        await ride.save();

        // Fetch updated ride
        const updatedRide = await Ride.findByPk(ride.id, {
            include: ['Passenger']
        });

        // Emit to passenger
        const io = getIO();
        io.to(`user:${ride.passenger_id}`).emit('ride:updated', updatedRide);

        res.json({ message: 'Ride rejected', ride: updatedRide });
    } catch (err) {
        console.error('Reject ride error:', err);
        res.status(500).json({ error: 'Failed to reject ride' });
    }
};

// Update ride status (Driver)
exports.updateRideStatus = async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ['in_progress', 'completed'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status update' });
    }

    try {
        const ride = await Ride.findByPk(req.params.id, {
            include: ['Passenger', 'Driver']
        });

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        if (ride.driver_id !== req.user.id) {
            return res.status(403).json({ error: 'Not your ride' });
        }

        ride.status = status;
        await ride.save();

        // Emit to passenger
        const io = getIO();
        io.to(`user:${ride.passenger_id}`).emit('ride:updated', ride);

        res.json({ message: 'Status updated', ride });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// Delete a ride
exports.deleteRide = async (req, res) => {
    try {
        const ride = await Ride.findByPk(req.params.id);

        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        // Only allow deletion if user is the passenger or driver involved
        if (ride.passenger_id !== req.user.id && ride.driver_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this ride' });
        }

        await ride.destroy();
        res.json({ message: 'Ride deleted successfully' });
    } catch (err) {
        console.error('Delete ride error:', err);
        res.status(500).json({ error: 'Failed to delete ride' });
    }
};
