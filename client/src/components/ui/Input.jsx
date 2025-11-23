export default function Input({ label, error, icon, ...props }) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    className={`input ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-sm text-red-400">{error}</span>
            )}
        </div>
    );
}
