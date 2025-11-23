import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';

export default function Home() {
    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="container mx-auto px-6 py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="animate-slide-down">
                            <h1 className="text-6xl lg:text-8xl font-bold mb-6 text-balance">
                                Your Ride,
                                <span className="gradient-text"> Your Way</span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto text-balance">
                                Experience the future of transportation with real-time ride booking,
                                instant matching, and seamless journeys.
                            </p>
                        </div>

                        <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <Button size="lg">
                                    Get Started
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="secondary" size="lg">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative gradient orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            </section>

            {/* Features Section */}
            <section className="py-24 relative">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        Why Choose <span className="gradient-text">RideBook</span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <div className="glass-card text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Instant Matching</h3>
                            <p className="text-gray-400">
                                Get matched with nearby drivers in seconds using our real-time matching algorithm.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Real-Time Updates</h3>
                            <p className="text-gray-400">
                                Track your ride status live without refreshing. Know exactly where your driver is.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Safe & Secure</h3>
                            <p className="text-gray-400">
                                Your safety is our priority. All drivers are verified and rated by the community.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="glass-card text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to ride?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Join thousands of riders and drivers connecting every day.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <Button size="lg">Join as Passenger</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="secondary" size="lg">Become a Driver</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
