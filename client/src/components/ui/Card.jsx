export default function Card({ children, hover = true, className = '', ...props }) {
    return (
        <div
            className={`glass-card ${hover ? '' : 'hover:transform-none hover:shadow-none'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
