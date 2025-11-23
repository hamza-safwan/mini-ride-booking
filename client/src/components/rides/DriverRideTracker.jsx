import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import MapView from '../ui/MapView';
import Button from '../ui/Button';
import axios from '../../api/axios';

export default function DriverRideTracker({ ride, onRideComplete }) {
    const [driverLocation, setDriverLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [updating, setUpdating] = useState(false);
    const { socket } = useSocket();

    // Parse pickup and drop locations
    const pickup = parseLocation(ride.pickup_location);
    const drop = parseLocation(ride.drop_location);

    // Get driver's current location and track it
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };
                setDriverLocation(newLocation);
                setLocationError(null);

                // Emit location to server via Socket.io
                if (socket && ride.id) {
                    socket.emit('location:update', {
                        rideId: ride.id,
                        location: newLocation,
                    });
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocationError('Unable to get your location. Please enable location services.');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        setWatchId(id);

        // Cleanup
        return () => {
            if (id) {
                navigator.geolocation.clearWatch(id);
            }
        };
    }, [socket, ride.id]);

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await axios.patch(`/rides/${ride.id}/status`, { status: newStatus });
            if (newStatus === 'completed' && onRideComplete) {
                onRideComplete();
            }
        } catch (error) {
            console.error('Error updating ride status:', error);
            alert('Failed to update ride status');
        } finally {
            setUpdating(false);
        }
    };

    // Calculate distance (simple Haversine formula)
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
                <h3 className="text-xl font-semibold mb-2">Active Ride</h3>
                <div className="flex items-center gap-2 mb-4">
                    <span className={`badge badge-${ride.status}`}>
                        {ride.status.replace('_', ' ')}
                    </span>
                    {locationError && (
                        <span className="text-sm text-red-400">⚠️ {locationError}</span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="text-sm text-gray-400">Passenger</div>
                        <div className="font-semibold">{ride.Passenger?.name || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">Phone</div>
                        <div className="font-semibold">{ride.Passenger?.phone || 'N/A'}</div>
                    </div>
                    {distance && (
                        <>
                            <div>
                                <div className="text-sm text-gray-400">Distance to Pickup</div>
                                <div className="font-semibold">{distance.toFixed(1)} km</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">ETA</div>
                                <div className="font-semibold">~{eta} min</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Map showing route to pickup */}
            <div className="mb-4">
                <MapView
                    pickup={pickup}
                    drop={drop}
                    driverLocation={driverLocation}
                    showRoute={ride.status === 'accepted'}
                    className="h-96"
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                {ride.status === 'accepted' && (
                    <Button
                        onClick={() => handleStatusUpdate('in_progress')}
                        loading={updating}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                        Start Ride (Picked Up)
                    </Button>
                )}
                {ride.status === 'in_progress' && (
                    <Button
                        onClick={() => handleStatusUpdate('completed')}
                        loading={updating}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        Complete Ride
                    </Button>
                )}
            </div>
        </div>
    );
}

// Helper function to parse location string
function parseLocation(locationString) {
    if (!locationString) return null;

    // Try to parse as JSON first (if locations are stored as JSON)
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
