require('dotenv').config({ path: '../.env' });

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-development',
    port: process.env.PORT || 3000,
    databasePath: process.env.DATABASE_PATH || './database.sqlite',
    nodeEnv: process.env.NODE_ENV || 'development'
};
