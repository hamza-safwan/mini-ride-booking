export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, ...props }) {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost'
    };

    const sizes = {
        sm: 'text-sm px-3 py-2',
        md: 'text-base px-6 py-3',
        lg: 'text-lg px-8 py-4'
    };

    return (
        <button
            className={`btn ${variants[variant]} ${sizes[size]}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}
