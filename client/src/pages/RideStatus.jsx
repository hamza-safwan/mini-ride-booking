import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import Navbar from '../components/ui/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PassengerRideTracker from '../components/rides/PassengerRideTracker';
import DriverRideTracker from '../components/rides/DriverRideTracker';
import Button from '../components/ui/Button';

export default function RideStatus() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { socket } = useSocket();

    // Get current user
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Fetch ride data
    const fetchRide = useCallback(async () => {
        try {
            const response = await axios.get(`/rides/${id}`);
            setRide(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching ride:', err);
            setError('Failed to load ride details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRide();
    }, [fetchRide]);

    // Listen for ride updates via socket
    useEffect(() => {
        if (!socket) return;

        const handleRideUpdated = (updatedRide) => {
            if (updatedRide.id === parseInt(id)) {
                setRide(updatedRide);

                // Redirect to dashboard if ride is completed
                if (updatedRide.status === 'completed') {
                    setTimeout(() => {
                        const userType = user?.type === 'passenger' ? 'passenger' : 'driver';
                        navigate(`/${userType}`);
                    }, 2000); // Give user 2 seconds to see completion message
                }
            }
        };

        socket.on('ride:updated', handleRideUpdated);

        return () => {
            socket.off('ride:updated', handleRideUpdated);
        };
    }, [socket, id, navigate, user]);

    const handleRideComplete = () => {
        // Redirect to dashboard after completion
        setTimeout(() => {
            const userType = user?.type === 'passenger' ? 'passenger' : 'driver';
            navigate(`/${userType}`);
        }, 1500);
    };

    const handleBackToDashboard = () => {
        const userType = user?.type === 'passenger' ? 'passenger' : 'driver';
        navigate(`/${userType}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !ride) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container mx-auto px-6 py-8">
                    <div className="glass-card text-center py-16">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-semibold mb-2">
                            {error || 'Ride not found'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            This ride may have been cancelled or completed
                        </p>
                        <Button onClick={handleBackToDashboard}>
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user is part of this ride
    const isPassenger = user?.id === ride.passenger_id;
    const isDriver = user?.id === ride.driver_id;

    if (!isPassenger && !isDriver) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="container mx-auto px-6 py-8">
                    <div className="glass-card text-center py-16">
                        <div className="text-6xl mb-4">🚫</div>
                        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
                        <p className="text-gray-400 mb-6">
                            You don't have permission to view this ride
                        </p>
                        <Button onClick={handleBackToDashboard}>
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {isPassenger ? 'Your' : 'Active'} <span className="gradient-text">Ride</span>
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Real-time tracking and updates
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleBackToDashboard}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Completion Message */}
                {ride.status === 'completed' && (
                    <div className="glass-card text-center py-8 mb-6 bg-green-500/10 border-green-500/30">
                        <div className="text-5xl mb-3">✅</div>
                        <h3 className="text-xl font-semibold mb-2 text-green-400">
                            Ride Completed!
                        </h3>
                        <p className="text-gray-300">
                            Redirecting to dashboard...
                        </p>
                    </div>
                )}

                {/* Tracker Component */}
                {isPassenger ? (
                    <PassengerRideTracker ride={ride} onComplete={handleRideComplete} />
                ) : (
                    <DriverRideTracker ride={ride} onRideComplete={handleRideComplete} />
                )}
            </div>
        </div>
    );
}
