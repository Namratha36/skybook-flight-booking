import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { Users, Plane, CalendarCheck, IndianRupee, LayoutDashboard, Plus, Trash2, Edit, CheckCircle, XCircle, Route, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, flights, bookings, users
  
  // Data States
  const [users, setUsers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        const [usersSnap, flightsSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'flights')),
          getDocs(collection(db, 'bookings'))
        ]);

        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setFlights(flightsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setBookings(bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        toast.error("Failed to fetch admin data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  // Handlers
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    }
  };

  const handleUpdateBooking = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast.success("Booking status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm("Delete this flight?")) return;
    try {
      await deleteDoc(doc(db, 'flights', flightId));
      setFlights(flights.filter(f => f.id !== flightId));
      toast.success("Flight deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete flight");
    }
  };

  // Calculations
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');
  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Popular routes
  const routeCounts = {};
  bookings.forEach(b => {
    const route = `${b.flightDetails?.from} → ${b.flightDetails?.to}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });
  const popularRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Mock Revenue Data for Chart (Using current bookings simulated over days)
  const chartData = [
    { name: 'Mon', revenue: totalRevenue * 0.1 },
    { name: 'Tue', revenue: totalRevenue * 0.15 },
    { name: 'Wed', revenue: totalRevenue * 0.1 },
    { name: 'Thu', revenue: totalRevenue * 0.25 },
    { name: 'Fri', revenue: totalRevenue * 0.05 },
    { name: 'Sat', revenue: totalRevenue * 0.15 },
    { name: 'Sun', revenue: totalRevenue * 0.2 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center bg-gray-50 dark:bg-[hsl(var(--background))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pt-20 pb-12 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-[hsl(var(--card))] border-r border-gray-200 dark:border-gray-800 md:min-h-screen p-4 flex-shrink-0 z-10">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 pl-2 hidden md:block">Admin Panel</h2>
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'flights', icon: Plane, label: 'Flights' },
            { id: 'bookings', icon: CalendarCheck, label: 'Bookings' },
            { id: 'users', icon: Users, label: 'Users' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              <tab.icon size={20} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 w-full max-w-full overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard Overview</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users size={24} /></div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                </div>
                <div className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Plane size={24} /></div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Flights</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{flights.length}</p>
                </div>
                <div className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><CalendarCheck size={24} /></div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                </div>
                <div className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><IndianRupee size={24} /></div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Demo Revenue</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Simulated / Fictional</p>
                </div>
              </div>

              {/* Secondary Stats Row: Booking Status Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[hsl(var(--card))] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Confirmed Bookings</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{confirmedBookings.length}</p>
                    </div>
                    <CheckCircle className="text-green-500 opacity-80" size={24} />
                  </div>
                </div>

                <div className="bg-white dark:bg-[hsl(var(--card))] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cancelled Bookings</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{cancelledBookings.length}</p>
                    </div>
                    <XCircle className="text-red-500 opacity-80" size={24} />
                  </div>
                </div>

                <div className="bg-white dark:bg-[hsl(var(--card))] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending Bookings</p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingBookings.length}</p>
                    </div>
                    <Clock className="text-amber-500 opacity-80" size={24} />
                  </div>
                </div>

                <div className="bg-white dark:bg-[hsl(var(--card))] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Confirmation Rate</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {bookings.length ? Math.round((confirmedBookings.length / bookings.length) * 100) : 0}%
                      </p>
                    </div>
                    <TrendingUp className="text-indigo-500 opacity-80" size={24} />
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics & Booking Trends</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Simulated 7-day revenue trend based on confirmed sample bookings</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    DEMO DATA
                  </span>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        itemStyle={{ color: '#60a5fa' }}
                        formatter={(val) => [`₹${Math.round(val).toLocaleString()}`, 'Demo Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Popular Routes and Recent Bookings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Flight Routes */}
                <div className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Route className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular Flight Routes</h3>
                  </div>
                  <div className="space-y-3">
                    {popularRoutes.length > 0 ? (
                      popularRoutes.map(([route, count], idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{route}</span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {count} {count === 1 ? 'booking' : 'bookings'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 py-4 text-center">No route data yet. Seed demo data to preview.</p>
                    )}
                  </div>
                </div>

                {/* Recent Bookings Preview */}
                <div className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-600" size={20} />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Bookings</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {bookings.slice(0, 5).map(b => (
                      <div key={b.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{b.passengerName}</p>
                          <p className="text-xs text-gray-500">{b.flightDetails?.from} → {b.flightDetails?.to}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">₹{b.totalPrice?.toLocaleString()}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            b.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <p className="text-sm text-gray-500 py-4 text-center">No bookings recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FLIGHTS */}
          {activeTab === 'flights' && (
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Flights</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <Plus size={16} /> Add Flight
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Airline</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map(f => (
                      <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {f.airline} <span className="block text-xs text-gray-500">{f.flightNumber}</span>
                        </td>
                        <td className="px-6 py-4">{f.from} <br/> {f.to}</td>
                        <td className="px-6 py-4">
                          {new Date(f.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-6 py-4">₹{f.price}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteFlight(f.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {flights.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-8">No flights available. Seed data to test.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">ID / Date</th>
                      <th className="px-6 py-4">Passenger</th>
                      <th className="px-6 py-4">Flight</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-mono text-xs text-gray-900 dark:text-white">
                          {b.id.substring(0,8)}<br/>
                          <span className="text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{b.passengerName}</td>
                        <td className="px-6 py-4">
                          {b.flightDetails.from} to {b.flightDetails.to}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {b.status !== 'Cancelled' ? (
                            <button 
                              onClick={() => handleUpdateBooking(b.id, 'Cancelled')}
                              className="text-red-600 hover:underline text-xs flex items-center gap-1"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateBooking(b.id, 'Confirmed')}
                              className="text-green-600 hover:underline text-xs flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                           {u.photoURL ? <img src={u.photoURL} alt="p" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={14}/></div>}
                           {u.displayName || 'Unnamed User'}
                        </td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={u.role || 'user'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
