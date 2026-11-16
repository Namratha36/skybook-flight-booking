import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Plane, Clock, Filter, ArrowRight } from 'lucide-react';
import FlightSearchForm from '../components/FlightSearchForm';
import { getDemoFlights } from '../data/demoData';

export default function SearchFlights() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Sort State
  const [sortBy, setSortBy] = useState('price'); // price, duration, departure
  const [selectedAirline, setSelectedAirline] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [stops, setStops] = useState('All');

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      try {
        const q = query(collection(db, 'flights'));
        const querySnapshot = await getDocs(q);
        const fetchedFlights = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (fetchedFlights.length > 0) {
          setFlights(fetchedFlights);
        } else {
          setFlights(getDemoFlights());
        }
      } catch (error) {
        console.warn("Using sample demo flights (Firestore offline or auth required):", error.message);
        setFlights(getDemoFlights());
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, []);

  // Compute unique airlines for filter
  const airlines = ['All', ...new Set(flights.map(f => f.airline))];

  // Filter and Sort Logic
  const filteredFlights = flights.filter(f => {
    // Basic search matching (if provided in URL)
    const searchFrom = searchParams.get('from')?.toLowerCase();
    const searchTo = searchParams.get('to')?.toLowerCase();
    
    if (searchFrom && !f.from.toLowerCase().includes(searchFrom)) return false;
    if (searchTo && !f.to.toLowerCase().includes(searchTo)) return false;

    // Filters
    if (selectedAirline !== 'All' && f.airline !== selectedAirline) return false;
    if (f.price > maxPrice) return false;
    if (stops !== 'All' && f.stops !== parseInt(stops)) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime);
    return 0;
  });

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pt-24 pb-12">
      {/* Search Header */}
      <div className="bg-blue-600 dark:bg-blue-900 pb-32 pt-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-blue-100">Find the best flights for your journey</p>
          <p className="text-xs text-blue-200 mt-2 bg-blue-700/50 dark:bg-blue-800/50 inline-block px-3 py-1 rounded-full">
            💡 Schedules, fares, and availability are realistic fictional sample records for demonstration.
          </p>
        </div>
      </div>

      <div className="px-4">
        <FlightSearchForm />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <Filter size={20} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sort By</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[hsl(var(--input))] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="price">Cheapest First</option>
                <option value="duration">Fastest First</option>
                <option value="departure">Earliest Departure</option>
              </select>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Stops</h3>
              <div className="space-y-2">
                {['All', '0', '1', '2'].map(stop => (
                  <label key={stop} className="flex items-center">
                    <input 
                      type="radio" 
                      name="stops" 
                      checked={stops === stop}
                      onChange={() => setStops(stop)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {stop === 'All' ? 'Any number of stops' : stop === '0' ? 'Non-stop' : `${stop} Stop(s)`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max Price</h3>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{maxPrice}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="100000" 
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Airlines</h3>
              <select 
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[hsl(var(--input))] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                {airlines.map(airline => (
                  <option key={airline} value={airline}>{airline}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Flight Results */}
        <div className="w-full md:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {loading ? 'Searching flights...' : `${filteredFlights.length} Flights Found`}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white dark:bg-[hsl(var(--card))] rounded-2xl p-6 h-32 border border-gray-200 dark:border-gray-800"></div>
              ))}
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
              <Plane className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No flights available</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
              {flights.length === 0 && (
                <div className="mt-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg inline-block">
                    Note: Database is empty. Use the Demo Data Seeder to populate realistic flights.
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={() => navigate('/seed')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      Go to Demo Seeder
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlights.map((flight, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={flight.id}
                  className="bg-white dark:bg-[hsl(var(--card))] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 w-full md:w-1/4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                      {flight.airline.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{flight.airline}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-between w-full">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(flight.departureTime)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{flight.from}</p>
                    </div>
                    
                    <div className="flex flex-col items-center px-4 w-full max-w-[200px]">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Clock size={12} /> {formatDuration(flight.durationMinutes)}
                      </span>
                      <div className="w-full relative flex items-center justify-center">
                        <div className="w-full h-[2px] bg-gray-300 dark:bg-gray-700 absolute"></div>
                        <Plane size={16} className="text-blue-500 z-10 bg-white dark:bg-[hsl(var(--card))] px-1" />
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(flight.arrivalTime)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{flight.to}</p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                    <div className="mb-0 md:mb-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{flight.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/flight/${flight.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
                    >
                      Book <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
