import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import SearchFlights from './pages/SearchFlights';
import FlightDetails from './pages/FlightDetails';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import SeedData from './pages/SeedData';
import NotFound from './pages/NotFound';
import { About, Careers, ContactUs, PrivacyPolicy, Terms } from './pages/StaticPages';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] transition-colors duration-300">
          <Toaster position="top-right" />
          <Navbar />
          <div className="flex-grow flex flex-col min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchFlights />} />
              <Route path="/flight/:id" element={<FlightDetails />} />
              <Route path="/seed" element={<SeedData />} />
              {/* Static Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Protected Routes for Users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/book/:id" element={<Booking />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Protected Route for Admin */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
