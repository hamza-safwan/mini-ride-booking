const express = require('express');
const app = express();
const sequelize = require('./db');
const User = require('./models/User');
const Ride = require('./models/Ride');
const { requireRole } = require('./middleware/requireRole');

const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Ride Booking API Running');
});

const rideRoutes = require('./routes/rideRoutes');
app.use('/rides', rideRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);



sequelize.sync({ force: true }).then(() => {
    console.log('Database synced!');
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
});
