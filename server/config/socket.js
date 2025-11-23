const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./index');

let io = null;

/**
 * Initialize Socket.IO with the HTTP server
 */
function initializeSocket(httpServer) {
    io = require('socket.io')(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST']
        }
    });

    // Authentication middleware for WebSocket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            socket.userId = decoded.id;
            socket.userType = decoded.type;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Handle connections
    io.on('connection', (socket) => {
        console.log(`✓ Socket connected: User ${socket.userId} (${socket.userType})`);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        // Join type-specific room (all drivers or all passengers)
        socket.join(`${socket.userType}s`);

        socket.on('disconnect', () => {
            console.log(`✗ Socket disconnected: User ${socket.userId}`);
        });

        // Real-time location tracking
        // Map to store active rides and their participants
        const activeRides = new Map(); // rideId -> { driverId, passengerId }

        socket.on('location:update', (data) => {
            const { rideId, location } = data;

            // Store the ride mapping
            if (!activeRides.has(rideId)) {
                activeRides.set(rideId, { driverId: socket.userId });
            }

            // Broadcast location to the passenger of this ride
            // The passenger will be listening on their user-specific room
            const ride = activeRides.get(rideId);

            // Emit to all connected sockets (passenger will filter by rideId)
            io.emit('location:broadcast', {
                rideId,
                location,
                timestamp: new Date(),
            });

            console.log(`📍 Location update from driver ${socket.userId} for ride ${rideId}`);
        });

        // When a ride is accepted, store the mapping
        socket.on('ride:accepted', (data) => {
            const { rideId, driverId, passengerId } = data;
            activeRides.set(rideId, { driverId, passengerId });
            console.log(`✓ Ride ${rideId} mapping stored: Driver ${driverId} - Passenger ${passengerId}`);
        });
    });

    return io;
}

/**
 * Get the Socket.IO instance
 */
function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocket first.');
    }
    return io;
}

module.exports = {
    initializeSocket,
    getIO
};
