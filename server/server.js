const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { port, nodeEnv } = require('./config');
const { initializeSocket } = require('./config/socket');
const sequelize = require('./config/database');

// Import models to ensure they're registered
const User = require('./models/User');
const Ride = require('./models/Ride');

// Create Express app
const app = express();

// Create HTTP server for Socket.IO
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Middleware
app.use(cors({
    origin: true, // Reflects the request origin, supports dev and prod
    credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Ride Booking API Running',
        version: '2.0.0',
        features: ['Real-time updates', 'WebSocket support']
    });
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/rides', require('./routes/rideRoutes'));

// Serve built client in production-like environments if it exists
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    // SPA fallback: send index.html for unmatched routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

// Database sync and server start
// Use force: false to avoid dropping tables with foreign key constraints
// If you need to reset the database, manually delete the database.sqlite file
const syncDatabase = async () => {
    try {
        // For SQLite, we need to enable foreign keys first
        await sequelize.query('PRAGMA foreign_keys = OFF');

        // In development, automatically alter tables to match models (adds missing columns like city)
        // In other environments, keep the safer default (no destructive changes)
        const syncOptions = nodeEnv === 'development'
            ? { alter: true }
            : { force: false };

        await sequelize.sync(syncOptions);

        // Re-enable foreign keys
        await sequelize.query('PRAGMA foreign_keys = ON');

        console.log('✓ Database synced');

        httpServer.listen(port, () => {
            console.log(`✓ Server running on http://localhost:${port}`);
            console.log(`✓ Socket.IO enabled for real-time updates`);
        });
    } catch (err) {
        console.error('✗ Database sync failed:', err);
        console.error('\n💡 If you need to reset the database, delete the database.sqlite file and restart.');
        process.exit(1);
    }
};

syncDatabase();

module.exports = { app, httpServer, io };
