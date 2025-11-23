import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import LocationPicker from '../components/ui/LocationPicker';

export default function RequestRide() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        pickup_location: '',
        drop_location: '',
        ride_type: ''
    });
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropCoords, setDropCoords] = useState(null);
    const [activeMap, setActiveMap] = useState(null); // 'pickup' or 'drop' or null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapCenter, setMapCenter] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.city) {
                // Simple geocode for city
                const cityCoords = geocodeLocation(user.city);
                setMapCenter({ lat: cityCoords.lat, lng: cityCoords.lng });
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTypeSelect = (type) => {
        setFormData({ ...formData, ride_type: type });
    };

    const handleLocationSelect = (latlng) => {
        const coords = { lat: latlng.lat, lng: latlng.lng };
        const locationString = `Map Location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`;

        if (activeMap === 'pickup') {
            setPickupCoords(coords);
            setFormData(prev => ({ ...prev, pickup_location: locationString }));
        } else if (activeMap === 'drop') {
            setDropCoords(coords);
            setFormData(prev => ({ ...prev, drop_location: locationString }));
        }
        setActiveMap(null);
    };

    // Simple geocoding for demo - in production use Google Maps API or similar
    const geocodeLocation = (locationName) => {
        // Sample locations with coordinates (Islamabad/Rawalpindi area)
        const knownLocations = {
            'blue area': { lat: 33.7077, lng: 73.0589, name: 'Blue Area' },
            'f6': { lat: 33.7215, lng: 73.0433, name: 'F-6 Markaz' },
            'f7': { lat: 33.7114, lng: 73.0515, name: 'F-7 Markaz' },
            'g9': { lat: 33.6796, lng: 73.0552, name: 'G-9 Markaz' },
            'i8': { lat: 33.6639, lng: 73.0739, name: 'I-8 Markaz' },
            'saddar': { lat: 33.5977, lng: 73.0548, name: 'Saddar, Rawalpindi' },
            'pir wadhai': { lat: 33.5702, lng: 73.0786, name: 'Pir Wadhai' },
            'airport': { lat: 33.5490, lng: 72.8256, name: 'Islamabad Airport' },
            'pwd': { lat: 33.6844, lng: 73.0479, name: 'PWD' },
            'zero point': { lat: 33.6938, lng: 73.0651, name: 'Zero Point' },
            'lahore': { lat: 31.5204, lng: 74.3587, name: 'Lahore' },
            'karachi': { lat: 24.8607, lng: 67.0011, name: 'Karachi' },
            'multan': { lat: 30.1575, lng: 71.5249, name: 'Multan' },
            'peshawar': { lat: 34.0151, lng: 71.5249, name: 'Peshawar' },
            'quetta': { lat: 30.1798, lng: 66.9750, name: 'Quetta' },
        };

        const key = locationName.toLowerCase().trim();
        if (knownLocations[key]) {
            return knownLocations[key];
        }

        // Default to a random location in Islamabad for unknown locations
        const baseLocation = { lat: 33.6844, lng: 73.0479, name: locationName };
        // Add small random offset
        return {
            lat: baseLocation.lat + (Math.random() - 0.5) * 0.1,
            lng: baseLocation.lng + (Math.random() - 0.5) * 0.1,
            name: locationName
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.ride_type) {
            setError('Please select a ride type');
            return;
        }

        setLoading(true);

        try {
            // Use selected coords or geocode text input
            const finalPickup = pickupCoords || geocodeLocation(formData.pickup_location);
            const finalDrop = dropCoords || geocodeLocation(formData.drop_location);

            // Ensure name is set
            if (!finalPickup.name) finalPickup.name = formData.pickup_location;
            if (!finalDrop.name) finalDrop.name = formData.drop_location;

            // Save locations as JSON strings with coordinates
            const rideData = {
                pickup_location: JSON.stringify(finalPickup),
                drop_location: JSON.stringify(finalDrop),
                ride_type: formData.ride_type
            };

            await axios.post('/rides', rideData);
            navigate('/passenger');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request ride');
        } finally {
            setLoading(false);
        }
    };

    const rideTypes = [
        { value: 'bike', icon: '🏍️', name: 'Bike', description: 'Quick & Affordable' },
        { value: 'car', icon: '🚗', name: 'Car', description: 'Comfortable Ride' },
        { value: 'rickshaw', icon: '🛺', name: 'Rickshaw', description: 'Budget Friendly' }
    ];

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="container mx-auto px-6 py-16">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8 animate-slide-down">
                        <h1 className="text-4xl font-bold mb-3">
                            Request a <span className="gradient-text">Ride</span>
                        </h1>
                        <p className="text-gray-400">
                            Tell us where you want to go
                        </p>
                    </div>

                    <Card className="animate-slide-up">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Input
                                            label="Pickup Location"
                                            type="text"
                                            name="pickup_location"
                                            value={formData.pickup_location}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Blue Area, F7, G9, Airport"
                                            icon={
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <circle cx="10" cy="10" r="3" />
                                                </svg>
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setActiveMap(activeMap === 'pickup' ? null : 'pickup')}
                                        className="mb-[2px]"
                                    >
                                        📍 Map
                                    </Button>
                                </div>
                                {activeMap === 'pickup' && (
                                    <div className="animate-fade-in">
                                        <LocationPicker
                                            onLocationSelect={handleLocationSelect}
                                            initialPosition={pickupCoords}
                                            defaultCenter={mapCenter}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Input
                                            label="Drop Location"
                                            type="text"
                                            name="drop_location"
                                            value={formData.drop_location}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Saddar, I8, Zero Point, PWD"
                                            icon={
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setActiveMap(activeMap === 'drop' ? null : 'drop')}
                                        className="mb-[2px]"
                                    >
                                        📍 Map
                                    </Button>
                                </div>
                                {activeMap === 'drop' && (
                                    <div className="animate-fade-in">
                                        <LocationPicker
                                            onLocationSelect={handleLocationSelect}
                                            initialPosition={dropCoords}
                                            defaultCenter={mapCenter}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-3">
                                    Choose Ride Type
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {rideTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => handleTypeSelect(type.value)}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.ride_type === type.value
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">{type.icon}</div>
                                            <div className="font-semibold text-sm">{type.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    loading={loading}
                                >
                                    {loading ? 'Requesting...' : 'Request Ride'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => navigate('/passenger')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
