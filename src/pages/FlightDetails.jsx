import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plane, Clock, ShieldCheck, Luggage, Ban, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDemoFlights } from '../data/demoData';

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center bg-gray-50 dark:bg-[hsl(var(--background))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-[hsl(var(--background))]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Flight not found</h2>
        <button onClick={() => navigate('/search')} className="mt-4 text-blue-600 hover:underline">Return to Search</button>
      </div>
    );
  }

  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (isoString) => new Date(isoString).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatDuration = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-900 p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Flight Details</h1>
              <p className="text-blue-100 mt-1">{flight.airline} • {flight.flightNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">₹{flight.price.toLocaleString()}</p>
              <p className="text-sm text-blue-100">per passenger</p>
            </div>
          </div>

          {/* Journey Details */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Journey Itinerary</h2>
            
            <div className="flex flex-col md:flex-row justify-between items-center relative">
              <div className="text-center md:text-left w-full md:w-1/3">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatTime(flight.departureTime)}</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{flight.from}</p>
                <p className="text-sm text-gray-400 mt-1">{formatDate(flight.departureTime)}</p>
              </div>

              <div className="flex flex-col items-center w-full md:w-1/3 my-6 md:my-0">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Clock size={14} /> {formatDuration(flight.durationMinutes)}
                </span>
                <div className="w-full relative flex items-center justify-center">
                  <div className="w-full h-[2px] bg-blue-200 dark:bg-blue-900 absolute border-dashed border-t-2"></div>
                  <Plane size={24} className="text-blue-600 dark:text-blue-400 z-10 bg-white dark:bg-[hsl(var(--card))] px-1 transform rotate-90 md:rotate-0" />
                </div>
                <span className="text-sm font-medium mt-2 text-gray-600 dark:text-gray-300">
                  {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop(s)`}
                </span>
              </div>

              <div className="text-center md:text-right w-full md:w-1/3">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatTime(flight.arrivalTime)}</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{flight.to}</p>
                <p className="text-sm text-gray-400 mt-1">{formatDate(flight.arrivalTime)}</p>
              </div>
            </div>
          </div>

          {/* Policies & Info */}
          <div className="p-8 bg-gray-50 dark:bg-[hsl(var(--background))] grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2">
                  <Luggage className="text-blue-600" size={20} /> Baggage Policy
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 ml-7">
                  <li>Cabin Baggage: 7 kg (1 piece)</li>
                  <li>Check-in Baggage: 15 kg (1 piece)</li>
                  <li>Extra baggage can be purchased during check-in.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2">
                  <ShieldCheck className="text-green-600" size={20} /> Amenities
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 ml-7">
                  <li>In-flight meal included</li>
                  <li>USB Power Outlets</li>
                  <li>Free Entertainment System</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2">
                  <Ban className="text-red-500" size={20} /> Cancellation Policy
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                  Partially refundable. Cancellation fee of ₹3,000 applies if cancelled up to 24 hours before departure.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2">
                  <Info className="text-blue-500" size={20} /> Seat Availability
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                  {flight.availableSeats > 10 ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">{flight.availableSeats} seats available</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-500 font-semibold">Only {flight.availableSeats} seats left! Book soon.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button 
              onClick={() => navigate(`/book/${flight.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              Continue Booking <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
