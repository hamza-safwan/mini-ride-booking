import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

// Custom icons
const createCustomIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 12px;
                    height: 12px;
                    background-color: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                "></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const driverIcon = createCustomIcon('#10b981'); // Green for driver
const pickupIcon = createCustomIcon('#3b82f6'); // Blue for pickup
const dropIcon = createCustomIcon('#ef4444'); // Red for drop-off

// Component to auto-fit bounds when markers change
function AutoFitBounds({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions && positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [positions, map]);

    return null;
}

export default function MapView({
    pickup,
    drop,
    driverLocation,
    showRoute = true,
    center,
    zoom = 13,
    className = '',
}) {
    const mapRef = useRef(null);

    // Debug logging
    useEffect(() => {
        console.log('🗺️ MapView render:', { pickup, drop, driverLocation });
    }, [pickup, drop, driverLocation]);

    // Calculate positions for auto-fit
    const positions = [];
    if (pickup && pickup.lat && pickup.lng) positions.push([pickup.lat, pickup.lng]);
    if (drop && drop.lat && drop.lng) positions.push([drop.lat, drop.lng]);
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
        positions.push([driverLocation.lat, driverLocation.lng]);
    }

    // Default center if not provided - Islamabad, Pakistan
    const mapCenter = center ||
        (pickup && pickup.lat && pickup.lng ? [pickup.lat, pickup.lng] : [33.6844, 73.0479]);

    // Route polyline (simple straight line - in production, use routing API)
    const routePositions = [];
    if (showRoute && driverLocation && driverLocation.lat && driverLocation.lng && pickup && pickup.lat && pickup.lng) {
        routePositions.push(
            [driverLocation.lat, driverLocation.lng],
            [pickup.lat, pickup.lng]
        );
    } else if (showRoute && pickup && pickup.lat && pickup.lng && drop && drop.lat && drop.lng) {
        routePositions.push(
            [pickup.lat, pickup.lng],
            [drop.lat, drop.lng]
        );
    }

    return (
        <div
            className={`map-container ${className}`}
            style={{ height: '500px', width: '100%', minHeight: '400px', borderRadius: '1rem', overflow: 'hidden' }}
        >
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Auto-fit bounds */}
                {positions.length > 0 && <AutoFitBounds positions={positions} />}

                {/* Driver marker */}
                {driverLocation && driverLocation.lat && driverLocation.lng && (
                    <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                        <Popup>
                            <strong>Driver Location</strong>
                            {driverLocation.name && <div>{driverLocation.name}</div>}
                        </Popup>
                    </Marker>
                )}

                {/* Pickup marker */}
                {pickup && pickup.lat && pickup.lng && (
                    <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                        <Popup>
                            <strong>Pickup Location</strong>
                            <div>{pickup.name || 'Pickup Point'}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Drop-off marker */}
                {drop && drop.lat && drop.lng && (
                    <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
                        <Popup>
                            <strong>Drop-off Location</strong>
                            <div>{drop.name || 'Destination'}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Route line */}
                {routePositions.length > 0 && (
                    <Polyline
                        positions={routePositions}
                        color="#10b981"
                        weight={4}
                        opacity={0.7}
                        dashArray="10, 10"
                    />
                )}
            </MapContainer>
        </div>
    );
}
