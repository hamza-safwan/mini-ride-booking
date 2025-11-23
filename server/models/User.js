const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('passenger', 'driver'), allowNull: false },
    city: { type: DataTypes.STRING, defaultValue: 'Islamabad' },
    availability_status: {
        type: DataTypes.ENUM('available', 'unavailable'),
        defaultValue: 'available'
    }
});

module.exports = User;
