import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RequestRide from './pages/RequestRide';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import RideStatus from './pages/RideStatus';
import Settings from './pages/Settings';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/request" element={<RequestRide />} />
                <Route path="/passenger" element={<PassengerDashboard />} />
                <Route path="/driver" element={<DriverDashboard />} />
                <Route path="/ride/:id" element={<RideStatus />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
}
