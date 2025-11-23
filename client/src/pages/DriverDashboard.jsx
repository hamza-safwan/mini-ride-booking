import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RideCard from '../components/rides/RideCard';
import DriverRideTracker from '../components/rides/DriverRideTracker';
import Card from '../components/ui/Card';

export default function DriverDashboard() {
    const navigate = useNavigate();
    const [availableRides, setAvailableRides] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [availability, setAvailability] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const { socket, isConnected } = useSocket();

    const fetchData = useCallback(async () => {
        try {
            const [availableRes, myRidesRes, availabilityRes] = await Promise.all([
                axios.get('/rides/available'),
                axios.get('/rides'), // This now returns driver's history too
                axios.get('/users/availability')
            ]);

            setAvailableRides(availableRes.data);
            setMyRides(myRidesRes.data);
            setAvailability(availabilityRes.data.status);

            // Find active ride from my rides
            const active = myRidesRes.data.find(ride =>
                ride.status === 'accepted' || ride.status === 'in_progress'
            );
            setActiveRide(active || null);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleRideCreated = (newRide) => {
            setAvailableRides(prev => [newRide, ...prev]);
            showNotification('New Ride Available!', `From ${newRide.pickup_location} to ${newRide.drop_location}`);
        };

        const handleRideUpdated = (updatedRide) => {
            // Update available rides
            if (updatedRide.status !== 'requested') {
                setAvailableRides(prev => prev.filter(ride => ride.id !== updatedRide.id));
            }

            // Update my rides
            setMyRides(prev => {
                const exists = prev.find(r => r.id === updatedRide.id);
                if (exists) {
                    return prev.map(r => r.id === updatedRide.id ? updatedRide : r);
                } else if (updatedRide.driver_id === JSON.parse(localStorage.getItem('user')).id) {
                    return [updatedRide, ...prev];
                }
                return prev;
            });

            if (updatedRide.status === 'accepted' || updatedRide.status === 'in_progress') {
                if (updatedRide.driver_id === JSON.parse(localStorage.getItem('user')).id) {
                    setActiveRide(updatedRide);
                }
            } else if (updatedRide.status === 'completed' || updatedRide.status === 'cancelled') {
                if (activeRide && activeRide.id === updatedRide.id) {
                    setActiveRide(null);
                }
            }
        };

        socket.on('ride:created', handleRideCreated);
        socket.on('ride:updated', handleRideUpdated);

        return () => {
            socket.off('ride:created', handleRideCreated);
            socket.off('ride:updated', handleRideUpdated);
        };
    }, [socket, activeRide]);

    const showNotification = (title, message) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    };

    const toggleAvailability = async () => {
        try {
            const response = await axios.patch('/users/availability');
            setAvailability(response.data.status);
        } catch (err) {
            console.error('Error toggling availability:', err);
        }
    };

    const handleAction = async (rideId, action) => {
        setActionLoading(prev => ({ ...prev, [rideId]: action }));

        try {
            await axios.post(`/rides/${rideId}/${action}`);
            // Optimistic update will be handled by socket or re-fetch
            if (action === 'accept') {
                const ride = availableRides.find(r => r.id === rideId);
                if (ride) {
                    navigate(`/ride/${rideId}`);
                }
            }
        } catch (err) {
            console.error(`Error ${action}ing ride:`, err);
            alert(`Failed to ${action} ride`);
        } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                delete newState[rideId];
                return newState;
            });
        }
    };

    const handleDeleteRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to delete this ride history?')) return;
        try {
            await axios.delete(`/rides/${rideId}`);
            setMyRides(prev => prev.filter(r => r.id !== rideId));
        } catch (err) {
            console.error('Failed to delete ride:', err);
            alert('Failed to delete ride');
        }
    };

    // Analytics
    const stats = {
        total: myRides.length,
        completed: myRides.filter(r => r.status === 'completed').length,
        earnings: myRides
            .filter(r => r.status === 'completed' && r.fare)
            .reduce((acc, curr) => acc + parseFloat(curr.fare), 0)
            .toFixed(2),
        rating: '4.8' // Placeholder
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Driver <span className="gradient-text">Dashboard</span>
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                            {isConnected ? 'Real-time updates active' : 'Connecting...'}
                        </div>
                    </div>
                    <Button
                        onClick={toggleAvailability}
                        variant={availability === 'available' ? 'primary' : 'secondary'}
                    >
                        <div className={`w-2 h-2 rounded-full mr-2 ${availability === 'available' ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                        {availability === 'available' ? 'Available' : 'Unavailable'}
                    </Button>
                </div>

                {/* Active Ride Tracking */}
                {activeRide && (
                    <div className="mb-8">
                        <DriverRideTracker
                            ride={activeRide}
                            onRideComplete={() => {
                                setActiveRide(null);
                                fetchData();
                            }}
                        />
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Analytics Card */}
                    <div className="lg:col-span-1">
                        <Card className="h-full">
                            <h2 className="text-xl font-semibold mb-6">Overview Analytics</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">{stats.total}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Total Rides</div>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-green-400 mb-1">{stats.completed}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Completed</div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-center col-span-2">
                                    <div className="text-3xl font-bold text-yellow-400 mb-1">${stats.earnings}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Total Earnings</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* History Card */}
                    <div className="lg:col-span-2">
                        <Card className="h-full max-h-[500px] overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-6">Ride History</h2>
                            {myRides.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-4xl mb-3">📜</div>
                                    <p>No ride history yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myRides.map((ride) => (
                                        <div key={ride.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                                        ${ride.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                            ride.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                                ride.status === 'accepted' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-blue-500/20 text-blue-400'}`}>
                                                        {ride.status.toUpperCase()}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">
                                                        {new Date(ride.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-400">●</span>
                                                        <span className="truncate max-w-[150px]">{JSON.parse(ride.pickup_location).name || 'Pickup'}</span>
                                                    </div>
                                                    <div className="hidden md:block text-gray-600">→</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-red-400">●</span>
                                                        <span className="truncate max-w-[150px]">{JSON.parse(ride.drop_location).name || 'Drop'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRide(ride.id)}
                                                className="ml-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete from history"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Available Rides Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Available Rides
                        {availableRides.length > 0 && (
                            <span className="ml-2 text-sm text-gray-400">({availableRides.length})</span>
                        )}
                    </h2>

                    {availableRides.length === 0 ? (
                        <div className="glass-card text-center py-16">
                            <div className="text-6xl mb-4">🚗</div>
                            <h3 className="text-xl font-semibold mb-2">No available rides</h3>
                            <p className="text-gray-400">
                                {availability === 'available'
                                    ? "You'll be notified when new rides are requested"
                                    : "Set your status to available to see ride requests"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {availableRides.map((ride) => (
                                <RideCard
                                    key={ride.id}
                                    ride={ride}
                                    actions={
                                        <>
                                            <Button
                                                onClick={() => handleAction(ride.id, 'accept')}
                                                loading={actionLoading[ride.id] === 'accept'}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(ride.id, 'reject')}
                                                loading={actionLoading[ride.id] === 'reject'}
                                                variant="secondary"
                                                className="flex-1"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
