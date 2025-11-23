import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import MapView from '../ui/MapView';

export default function PassengerRideTracker({ ride, onComplete }) {
    const [driverLocation, setDriverLocation] = useState(null);
    const { socket } = useSocket();

    // Parse pickup and drop locations
    const pickup = parseLocation(ride.pickup_location);
    const drop = parseLocation(ride.drop_location);

    // Listen for driver location updates
    useEffect(() => {
        if (!socket || !ride.id) return;

        const handleLocationUpdate = (data) => {
            if (data.rideId === ride.id) {
                setDriverLocation(data.location);
            }
        };

        socket.on('location:broadcast', handleLocationUpdate);

        return () => {
            socket.off('location:broadcast', handleLocationUpdate);
        };
    }, [socket, ride.id]);

    // Trigger onComplete callback when ride is completed
    useEffect(() => {
        if (ride.status === 'completed' && onComplete) {
            onComplete();
        }
    }, [ride.status, onComplete]);

    // Calculate distance and ETA
    const calculateDistance = useCallback((from, to) => {
        if (!from || !to) return null;

        const R = 6371; // Earth's radius in km
        const dLat = (to.lat - from.lat) * Math.PI / 180;
        const dLon = (to.lng - from.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }, []);

    const distance = driverLocation && pickup ? calculateDistance(driverLocation, pickup) : null;
    const eta = distance ? Math.round((distance / 40) * 60) : null; // Assuming 40 km/h average speed

    return (
        <div className="glass-card">
            <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Your Active Ride</h3>
                <div className="flex items-center gap-2 mb-4">
                    <span className={`badge badge-${ride.status}`}>
                        {ride.status.replace('_', ' ')}
                    </span>
                    {!driverLocation && ride.status === 'accepted' && (
                        <span className="text-sm text-gray-400 animate-pulse">
                            Waiting for driver location...
                        </span>
                    )}
                </div>

                {/* Ride Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="text-sm text-gray-400">Driver</div>
                        <div className="font-semibold">{ride.Driver?.name || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">Phone</div>
                        <div className="font-semibold">{ride.Driver?.phone || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">Vehicle</div>
                        <div className="font-semibold">{ride.Driver?.vehicle_details || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">Fare</div>
                        <div className="font-semibold">Rs. {ride.fare || '0'}</div>
                    </div>
                    {distance && ride.status === 'accepted' && (
                        <>
                            <div>
                                <div className="text-sm text-gray-400">Driver Distance</div>
                                <div className="font-semibold text-green-500">{distance.toFixed(1)} km</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Estimated Arrival</div>
                                <div className="font-semibold text-green-500">~{eta} min</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Status Messages */}
                {ride.status === 'accepted' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-400">
                            🚗 Driver is on the way to pick you up!
                        </p>
                    </div>
                )}
                {ride.status === 'in_progress' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-400">
                            ✅ Ride in progress - On the way to destination
                        </p>
                    </div>
                )}
            </div>

            {/* Map showing driver location and route */}
            <div className="mb-4">
                <MapView
                    pickup={pickup}
                    drop={drop}
                    driverLocation={driverLocation}
                    showRoute={ride.status === 'accepted'}
                    className="h-96"
                />
            </div>

            {/* Route Details */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/10 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Pickup</div>
                    <div className="text-sm font-medium">{pickup?.name || ride.pickup_location}</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Drop-off</div>
                    <div className="text-sm font-medium">{drop?.name || ride.drop_location}</div>
                </div>
            </div>
        </div>
    );
}

// Helper function to parse location string
function parseLocation(locationString) {
    if (!locationString) return null;

    // Try to parse as JSON first
    try {
        const parsed = JSON.parse(locationString);
        if (parsed.lat && parsed.lng) {
            return parsed;
        }
    } catch (e) {
        // Not JSON, continue
    }

    // Try to extract coordinates from string like "Location Name (lat, lng)"
    const match = locationString.match(/\(([^,]+),\s*([^)]+)\)/);
    if (match) {
        return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2]),
            name: locationString.split('(')[0].trim(),
        };
    }

    // Default to Islamabad if parsing fails
    return {
        lat: 33.6844,
        lng: 73.0479,
        name: locationString,
    };
}
