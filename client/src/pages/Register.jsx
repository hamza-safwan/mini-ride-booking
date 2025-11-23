import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        type: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTypeSelect = (type) => {
        setFormData({ ...formData, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.type) {
            setError('Please select user type');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/auth/register', formData);
            // Auto-login after registration
            const loginResponse = await axios.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            localStorage.setItem('token', loginResponse.data.token);
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));

            const redirectPath = formData.type === 'passenger' ? '/passenger' : '/driver';
            navigate(redirectPath);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="container mx-auto px-6 py-16">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8 animate-slide-down">
                        <h1 className="text-4xl font-bold mb-3">
                            Create Your <span className="gradient-text">Account</span>
                        </h1>
                        <p className="text-gray-400">
                            Join the revolution in transportation
                        </p>
                    </div>

                    <Card className="animate-slide-up">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* User Type Selection */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-3">
                                    I want to
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeSelect('passenger')}
                                        className={`p-6 rounded-xl border-2 transition-all ${formData.type === 'passenger'
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">🚗</div>
                                        <div className="font-semibold">Book Rides</div>
                                        <div className="text-sm text-gray-400 mt-1">As a Passenger</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeSelect('driver')}
                                        className={`p-6 rounded-xl border-2 transition-all ${formData.type === 'driver'
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">👨‍✈️</div>
                                        <div className="font-semibold">Drive & Earn</div>
                                        <div className="text-sm text-gray-400 mt-1">As a Driver</div>
                                    </button>
                                </div>
                            </div>

                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                loading={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                                Sign in here
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
