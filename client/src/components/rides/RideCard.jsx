import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function RideCard({ ride, actions }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const rideTypeIcons = {
        bike: '🏍️',
        car: '🚗',
        rickshaw: '🛺'
    };

    return (
        <Card className="animate-slide-up">
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">
                            {rideTypeIcons[ride.ride_type] || '🚗'}
                        </div>
                        <div>
                            <div className="font-semibold text-lg">
                                {ride.Passenger?.name || 'Unknown Passenger'}
                            </div>
                            {ride.createdAt && (
                                <div className="text-sm text-gray-400">
                                    {formatDate(ride.createdAt)}
                                </div>
                            )}
                        </div>
                    </div>
                    <Badge status={ride.status} />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="3" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Pickup</div>
                            <div className="text-gray-200">{ride.pickup_location}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Dropoff</div>
                            <div className="text-gray-200">{ride.drop_location}</div>
                        </div>
                    </div>
                </div>

                {ride.Driver && (
                    <div className="pt-3 border-t border-white/10">
                        <div className="text-sm text-gray-400">Driver</div>
                        <div className="text-gray-200 font-medium">{ride.Driver.name}</div>
                    </div>
                )}

                {actions && (
                    <div className="flex gap-2 pt-2">
                        {actions}
                    </div>
                )}
            </div>
        </Card>
    );
}
