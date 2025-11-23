import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Settings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        city: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // We need to implement a get profile endpoint or just use local storage if we trust it
                // But better to fetch fresh data. 
                // Since we didn't explicitly make a GET /profile, we can use the user data from localStorage for now
                // or assume the user object is available. 
                // Let's check if we can get it from localStorage first.
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || '',
                        email: user.email || '',
                        city: user.city || 'Islamabad'
                    }));
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                city: formData.city
            };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await axios.put('/users/profile', updateData);

            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">
                        Account <span className="gradient-text">Settings</span>
                    </h1>

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message.text && (
                                <div className={`p-4 rounded-lg ${message.type === 'error'
                                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                        : 'bg-green-500/10 border border-green-500/30 text-green-400'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Input
                                label="Primary City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g. Lahore, Islamabad, Karachi"
                                required
                                description="This will be used as your default map location."
                            />

                            <div className="border-t border-white/10 pt-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-300">Change Password</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="New Password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current"
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" loading={loading}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
