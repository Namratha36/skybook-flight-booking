import { useState } from 'react';
import { collection, addDoc, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { Plane, Trash2, Database } from 'lucide-react';

const airlines = ['IndiGo', 'Air India', 'Vistara', 'Akasa Air', 'SpiceJet'];
const routes = [
  { from: 'Hyderabad', to: 'Delhi', basePrice: 5000, duration: 130 },
  { from: 'Delhi', to: 'Hyderabad', basePrice: 4800, duration: 135 },
  { from: 'Hyderabad', to: 'Mumbai', basePrice: 4000, duration: 90 },
  { from: 'Mumbai', to: 'Hyderabad', basePrice: 4200, duration: 85 },
  { from: 'Bengaluru', to: 'Delhi', basePrice: 6000, duration: 165 },
  { from: 'Delhi', to: 'Bengaluru', basePrice: 5800, duration: 170 },
  { from: 'Chennai', to: 'Kolkata', basePrice: 5500, duration: 140 },
  { from: 'Kolkata', to: 'Chennai', basePrice: 5400, duration: 145 },
  { from: 'Delhi', to: 'Dubai', basePrice: 15000, duration: 240 },
  { from: 'Mumbai', to: 'Singapore', basePrice: 22000, duration: 330 },
];

function generateRandomFlights(count) {
  const flights = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    
    // Generate departure time between tomorrow and 30 days from now
    const departure = new Date(now);
    departure.setDate(departure.getDate() + 1 + Math.floor(Math.random() * 30));
    departure.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0);

    // Calculate arrival time
    const arrival = new Date(departure);
    arrival.setMinutes(arrival.getMinutes() + route.duration);

    // Randomize stops
    const stops = Math.random() > 0.7 ? 1 : 0;
    
    // Increase duration and price if there are stops
    const finalDuration = stops > 0 ? route.duration + 90 : route.duration;
    const finalPrice = Math.floor(route.basePrice * (1 + Math.random() * 0.5));
    if (stops > 0) arrival.setMinutes(arrival.getMinutes() + 90);

    const flightNumber = `${airline.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    flights.push({
      airline,
      flightNumber,
      from: route.from,
      to: route.to,
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      durationMinutes: finalDuration,
      price: finalPrice,
      availableSeats: Math.floor(Math.random() * 60) + 5,
      baggage: '7kg Cabin, 15kg Check-in',
      class: 'Economy',
      stops,
      amenities: ['In-flight meal', 'Entertainment', 'USB Power']
    });
  }
  return flights;
}

export default function SeedData() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const flightsToSeed = generateRandomFlights(20);
      const flightsCollection = collection(db, 'flights');
      
      const promises = flightsToSeed.map(flight => addDoc(flightsCollection, flight));
      await Promise.all(promises);
      
      toast.success('Successfully seeded 20 flights into Firestore!');
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed flights.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to delete all flights? This cannot be undone.")) return;
    
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'flights'));
      
      // Firestore batch deletes up to 500 documents
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(doc(db, 'flights', document.id));
      });
      
      await batch.commit();
      toast.success(`Successfully cleared ${querySnapshot.size} flights!`);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear flights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-[hsl(var(--background))] px-4">
      <div className="bg-white dark:bg-[hsl(var(--card))] p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-800 text-center">
        <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Database size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Database Tools</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Manage dummy data for your flights collection. Use these tools for testing purposes.</p>

        <div className="space-y-4">
          <button 
            onClick={handleSeed}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            <Plane size={20} />
            {loading ? 'Processing...' : 'Seed 20 Flights'}
          </button>

          <button 
            onClick={handleClear}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-red-600 dark:text-red-500 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            <Trash2 size={20} />
            {loading ? 'Processing...' : 'Clear All Flights'}
          </button>
        </div>
      </div>
    </div>
  );
}
