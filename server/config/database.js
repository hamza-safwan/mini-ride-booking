const { Sequelize } = require('sequelize');
const { databasePath } = require('./index');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: databasePath,
    logging: false, // Set to console.log to see SQL queries
    define: {
        timestamps: true,
        underscored: false
    },
    // Enable foreign keys for SQLite
    dialectOptions: {
        // This ensures foreign keys are properly handled
    }
});

// Test the connection
sequelize.authenticate()
    .then(() => console.log('✓ Database connected'))
    .catch(err => console.error('✗ Database connection failed:', err));

module.exports = sequelize;
