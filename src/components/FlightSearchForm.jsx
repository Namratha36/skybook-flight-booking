import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Users, Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function FlightSearchForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to search page with query params
    const params = new URLSearchParams({
      from,
      to,
      date: departureDate.toISOString(),
      passengers,
      class: travelClass
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-2xl p-6 md:p-8 -mt-24 relative z-10">
      <form onSubmit={handleSearch}>
        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="tripType" defaultChecked className="text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">One Way</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="tripType" className="text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Round Trip</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">From</label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                required
                list="popular-indian-cities"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="City or Airport (e.g. Hyderabad)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">To</label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                required
                list="popular-indian-cities"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="City or Airport (e.g. Bengaluru)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              />
              <datalist id="popular-indian-cities">
                <option value="Hyderabad" />
                <option value="Bengaluru" />
                <option value="Delhi" />
                <option value="Mumbai" />
                <option value="Chennai" />
                <option value="Kolkata" />
              </datalist>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Departure</label>
            <div className="relative flex items-center custom-datepicker">
              <CalendarIcon className="absolute left-3 text-gray-400 z-10" size={18} />
              <DatePicker
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                dateFormat="dd MMM yyyy"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Return</label>
            <div className="relative flex items-center custom-datepicker">
              <CalendarIcon className="absolute left-3 text-gray-400 z-10" size={18} />
              <DatePicker
                selected={returnDate}
                onChange={(date) => setReturnDate(date)}
                placeholderText="Add return date"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                dateFormat="dd MMM yyyy"
                minDate={departureDate}
              />
            </div>
          </div>

          <div className="relative flex flex-col justify-end">
            <button
              type="submit"
              className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              <span>Search Flights</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[hsl(var(--input))] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <Users className="text-gray-400" size={16} />
            <select 
              value={passengers} 
              onChange={(e) => setPassengers(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num} className="dark:bg-gray-800">{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[hsl(var(--input))] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <select 
              value={travelClass} 
              onChange={(e) => setTravelClass(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 outline-none cursor-pointer"
            >
              <option value="Economy" className="dark:bg-gray-800">Economy Class</option>
              <option value="Premium Economy" className="dark:bg-gray-800">Premium Economy</option>
              <option value="Business" className="dark:bg-gray-800">Business Class</option>
              <option value="First" className="dark:bg-gray-800">First Class</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
