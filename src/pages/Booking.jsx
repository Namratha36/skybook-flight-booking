import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Plane, CheckCircle, Grid } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDemoFlights } from '../data/demoData';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Form State
  const [passengerName, setPassengerName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    async function fetchFlight() {
      try {
        const docRef = doc(db, 'flights', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFlight({ id: docSnap.id, ...docSnap.data() });
        } else {
          const fallback = getDemoFlights().find(f => f.id === id || f._demoId === id);
          if (fallback) setFlight(fallback);
        }
      } catch (error) {
        const fallback = getDemoFlights().find(f => f.id === id || f._demoId === id);
        if (fallback) setFlight(fallback);
      } finally {
        setLoading(false);
      }
    }
    fetchFlight();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSeat) {
      toast.error('Please select a seat');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingRef = 'SKB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingData = {
        userId: currentUser?.uid || 'demo-user-skybook-2024',
        flightId: flight.id,
        bookingRef,
        passengerName,
        email,
        phone,
        seatNumber: selectedSeat,
        totalPrice: flight.price,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed',
        paymentStatus: 'Demo Paid',
        isDemo: true,
        flightDetails: {
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          from: flight.from,
          to: flight.to,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
        }
      };

      try {
        await addDoc(collection(db, 'bookings'), bookingData);
      } catch (dbErr) {
        console.warn("Firestore save fallback to local storage:", dbErr.message);
        const local = JSON.parse(localStorage.getItem('skybook_local_bookings') || '[]');
        local.unshift({ id: 'local-' + Date.now(), ...bookingData });
        localStorage.setItem('skybook_local_bookings', JSON.stringify(local));
      }
      
      toast.success(`Booking Confirmed! Ref: ${bookingRef}`);
      navigate('/my-bookings');
    } catch (error) {
      toast.error('Failed to book flight: ' + error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center bg-gray-50 dark:bg-[hsl(var(--background))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!flight) return null;

  // Mock Seat Map Generation
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        
        {/* Left Form Area */}
        <div className="flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <User className="text-blue-600" /> Passenger Information
            </h2>
            
            <form id="booking-form" onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (For Ticket)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Grid className="text-blue-600" /> Seat Selection
            </h2>
            
            <div className="bg-gray-50 dark:bg-[hsl(var(--background))] rounded-xl p-8 overflow-x-auto border border-gray-200 dark:border-gray-700">
              <div className="min-w-[400px] flex justify-center">
                <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                  {columns.map(col => (
                    <div key={col} className="flex justify-center text-xs font-bold text-gray-400">{col}</div>
                  ))}
                  
                  {rows.map((row) => (
                    <>
                      {/* Left Side (A, B, C) */}
                      {columns.slice(0, 3).map(col => {
                        const seatId = `${col}${row}`;
                        // Mock randomly some booked seats
                        const isBooked = (col * row.charCodeAt(0)) % 5 === 0;
                        const isSelected = selectedSeat === seatId;
                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-10 h-12 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-all border-2 
                              ${isBooked ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-800' 
                                : isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-110' 
                                : 'bg-white border-blue-200 hover:border-blue-400 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}
                          >
                            {seatId}
                          </button>
                        );
                      })}

                      {/* Aisle Spacer */}
                      <div className="w-8 flex items-center justify-center font-bold text-gray-300">{row}</div>

                      {/* Right Side (D, E, F) */}
                      {columns.slice(3, 6).map(col => {
                        const seatId = `${col+3}${row}`;
                        const isBooked = (col * row.charCodeAt(0)) % 6 === 0;
                        const isSelected = selectedSeat === seatId;
                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-10 h-12 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-all border-2 
                              ${isBooked ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-800' 
                                : isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-110' 
                                : 'bg-white border-blue-200 hover:border-blue-400 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-6 mt-6 justify-center">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-300 dark:bg-gray-800 rounded-sm"></div> <span className="text-sm text-gray-600 dark:text-gray-400">Booked</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white dark:bg-gray-700 border-2 border-blue-200 dark:border-gray-600 rounded-sm"></div> <span className="text-sm text-gray-600 dark:text-gray-400">Available</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded-sm"></div> <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span></div>
            </div>
          </motion.div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 sticky top-24"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Price Summary</h2>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-[hsl(var(--background))] rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900 dark:text-white">{flight.from}</span>
                <Plane size={16} className="text-blue-600" />
                <span className="font-bold text-gray-900 dark:text-white">{flight.to}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{flight.airline} • {flight.flightNumber}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Base Fare (1 Adult)</span>
                <span>₹{flight.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Taxes & Fees</span>
                <span>₹{(flight.price * 0.18).toLocaleString()}</span>
              </div>
              {selectedSeat && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span>Seat Selection ({selectedSeat})</span>
                  <span>Included</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total Amount</span>
                <span>₹{(flight.price * 1.18).toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="booking-form"
              disabled={bookingLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {bookingLoading ? 'Processing...' : (
                <><CheckCircle size={20} /> Confirm Booking (DEMO)</>
              )}
            </button>
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-center text-amber-700 dark:text-amber-300 font-medium">
                🎓 DEMO MODE — No real payment will be charged. This is a simulated booking for demonstration purposes.
              </p>
            </div>
            <p className="text-xs text-center text-gray-500 mt-3">By clicking confirm, you agree to our Terms & Conditions.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
