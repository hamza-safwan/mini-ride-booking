const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const rideController = require('../controllers/rideController');

// All ride routes require authentication
router.use(auth);

// Passenger/Driver routes
router.post('/', requireRole('passenger'), rideController.requestRide);
router.get('/', rideController.getMyRides);

// Driver routes - IMPORTANT: specific routes BEFORE parameterized routes
router.get('/available', requireRole('driver'), rideController.getAvailableRides);

// Parameterized routes (must come after specific routes)
router.get('/:id', rideController.getRideById);
router.post('/:id/accept', requireRole('driver'), rideController.acceptRide);
router.post('/:id/reject', requireRole('driver'), rideController.rejectRide);
router.patch('/:id/status', requireRole('driver'), rideController.updateRideStatus);
router.delete('/:id', rideController.deleteRide);

module.exports = router;
