import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RideCard from '../components/rides/RideCard';
import PassengerRideTracker from '../components/rides/PassengerRideTracker';
import Card from '../components/ui/Card';

export default function PassengerDashboard() {
    const navigate = useNavigate();
    const [rides, setRides] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket, isConnected } = useSocket();

    const fetchRides = useCallback(async () => {
        try {
            const response = await axios.get('/rides');
            setRides(response.data);
            // Find active ride
            const active = response.data.find(ride =>
                ride.status === 'accepted' || ride.status === 'in_progress'
            );
            setActiveRide(active || null);
        } catch (err) {
            console.error('Error fetching rides:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    // Real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleRideUpdated = (updatedRide) => {
            setRides(prevRides =>
                prevRides.map(ride =>
                    ride.id === updatedRide.id ? updatedRide : ride
                )
            );
        };

        const handleRideAccepted = (updatedRide) => {
            setRides(prevRides =>
                prevRides.map(ride =>
                    ride.id === updatedRide.id ? updatedRide : ride
                )
            );
            showNotification('Ride Accepted!', `${updatedRide.Driver?.name} has accepted your ride`);
            navigate(`/ride/${updatedRide.id}`);
        };

        socket.on('ride:updated', handleRideUpdated);
        socket.on('ride:accepted', handleRideAccepted);

        return () => {
            socket.off('ride:updated', handleRideUpdated);
            socket.off('ride:accepted', handleRideAccepted);
        };
    }, [socket, navigate]);

    const showNotification = (title, message) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    };

    const handleDeleteRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to delete this ride history?')) return;
        try {
            await axios.delete(`/rides/${rideId}`);
            setRides(prev => prev.filter(r => r.id !== rideId));
        } catch (err) {
            console.error('Failed to delete ride:', err);
            alert('Failed to delete ride');
        }
    };

    // Analytics
    const stats = {
        requested: rides.filter(r => r.status === 'requested').length,
        accepted: rides.filter(r => r.status === 'accepted' || r.status === 'in_progress').length,
        completed: rides.filter(r => r.status === 'completed').length,
        failed: rides.filter(r => r.status === 'rejected' || r.status === 'cancelled').length
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative z-0 bg-gray-900 text-white">
            <Navbar />

            <div className="container mx-auto px-6 py-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Passenger <span className="gradient-text">Dashboard</span>
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                            {isConnected ? 'Real-time updates active' : 'Connecting...'}
                        </div>
                    </div>
                    <Link to="/request">
                        <Button>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Request New Ride
                        </Button>
                    </Link>
                </div>

                {/* Active Ride Tracking */}
                {activeRide && (
                    <div className="mb-8">
                        <PassengerRideTracker ride={activeRide} />
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Analytics */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="h-full">
                            <h2 className="text-xl font-semibold mb-6">Overview Analytics</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">{stats.requested}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Requested</div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.accepted}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Accepted</div>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-green-400 mb-1">{stats.completed}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Completed</div>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-red-400 mb-1">{stats.failed}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Failed</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: History */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <h2 className="text-xl font-semibold mb-6">Ride History</h2>
                            {rides.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-4xl mb-3">📜</div>
                                    <p>No ride history yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {rides.map((ride) => (
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
            </div>
        </div>
    );
}
