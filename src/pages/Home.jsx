import { motion } from 'framer-motion';
import FlightSearchForm from '../components/FlightSearchForm';
import { Star } from 'lucide-react';

const destinations = [
  { id: 1, name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600&auto=format&fit=crop', price: '₹4,500' },
  { id: 2, name: 'Mumbai', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=600&auto=format&fit=crop', price: '₹5,200' },
  { id: 3, name: 'Bengaluru', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop', price: '₹4,800' },
  { id: 4, name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop', price: '₹18,500' },
  { id: 5, name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=600&auto=format&fit=crop', price: '₹22,000' },
];

const offers = [
  { id: 1, title: 'Summer Special', desc: 'Get up to 20% off on domestic flights', code: 'SUMMER20' },
  { id: 2, title: 'First Flight', desc: 'Flat ₹500 off on your first booking', code: 'WELCOME500' },
  { id: 3, title: 'Weekend Getaway', desc: '10% cashback on weekend flights', code: 'WKND10' },
];

const testimonials = [
  { id: 1, name: 'Rahul Sharma', review: 'SkyBook made my travel so much easier. The booking process is incredibly smooth and the prices are unbeatable!', rating: 5 },
  { id: 2, name: 'Priya Patel', review: 'Loved the user interface! Found the best deal for my Dubai trip within minutes. Highly recommend it.', rating: 5 },
  { id: 3, name: 'Amit Kumar', review: 'Customer support is top notch. The refund for my cancelled flight was processed instantly.', rating: 4 },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-[600px] w-full bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Book Flights Across the World
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl"
          >
            Experience premium travel at unbeatable prices. Your journey begins with SkyBook.
          </motion.p>
        </div>
      </div>

      {/* Search Form Section */}
      <div className="px-4">
        <FlightSearchForm />
      </div>

      {/* Popular Destinations */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Popular Destinations</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Explore our most booked cities this month</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {destinations.map((dest, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              key={dest.id} 
              className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer h-64 bg-gray-200 dark:bg-gray-800"
            >
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                <p className="text-gray-200 text-sm font-medium">From {dest.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Special Offers */}
      <div className="bg-blue-50 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Special Offers</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Exclusive deals for your next trip</p>
            </div>
            <button className="hidden sm:block text-blue-600 dark:text-blue-400 font-semibold hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                key={offer.id} 
                className="bg-white dark:bg-[hsl(var(--card))] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{offer.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 h-12">{offer.desc}</p>
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Use Code:</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold rounded-lg uppercase tracking-wider text-sm">{offer.code}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Our Customers Say</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Real experiences from our travelers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              key={test.id} 
              className="bg-white dark:bg-[hsl(var(--card))] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-6">"{test.review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  {test.name.charAt(0)}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">{test.name}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
