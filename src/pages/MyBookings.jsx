import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plane, Download, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid),
          orderBy('bookingDate', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [currentUser]);

  const downloadTicket = async (booking) => {
    setDownloadingId(booking.id);
    try {
      const ticketElement = document.getElementById(`ticket-${booking.id}`);
      if (!ticketElement) {
        throw new Error("Ticket element not found");
      }

      // Temporarily make it visible if it's hidden for PDF generation
      ticketElement.style.display = 'block';
      
      const canvas = await html2canvas(ticketElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SkyBook_Ticket_${booking.id}.pdf`);
      
      ticketElement.style.display = 'none';
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (isoString) => new Date(isoString).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center bg-gray-50 dark:bg-[hsl(var(--background))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <Plane className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
            <p className="text-gray-500 dark:text-gray-400">You haven't booked any flights. Start exploring destinations!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                key={booking.id}
                className="bg-white dark:bg-[hsl(var(--card))] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold text-white
                  ${booking.status === 'Confirmed' ? 'bg-green-500' : 
                    booking.status === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'}`}>
                  {booking.status}
                </div>

                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 md:pt-0">
                  <div className="col-span-1 md:col-span-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Flight</p>
                    <p className="font-bold text-gray-900 dark:text-white">{booking.flightDetails.airline}</p>
                    <p className="text-xs text-gray-500">{booking.flightDetails.flightNumber}</p>
                    <p className="text-sm font-semibold mt-2 text-blue-600 dark:text-blue-400">Seat: {booking.seatNumber}</p>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center justify-between">
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white">{formatTime(booking.flightDetails.departureTime)}</p>
                      <p className="text-sm text-gray-500">{booking.flightDetails.from}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(booking.flightDetails.departureTime)}</p>
                    </div>
                    
                    <div className="flex-1 px-4 flex justify-center text-gray-400">
                      <div className="w-full h-[1px] bg-gray-300 dark:bg-gray-700 mx-2 flex items-center justify-center">
                        <Plane size={16} className="text-blue-500 px-1 bg-white dark:bg-[hsl(var(--card))]" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white">{formatTime(booking.flightDetails.arrivalTime)}</p>
                      <p className="text-sm text-gray-500">{booking.flightDetails.to}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(booking.flightDetails.arrivalTime)}</p>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-1 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                    <button
                      onClick={() => downloadTicket(booking)}
                      disabled={downloadingId === booking.id || booking.status === 'Cancelled'}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm w-full md:w-auto justify-center disabled:opacity-50"
                    >
                      {downloadingId === booking.id ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
                      E-Ticket
                    </button>
                    <p className="text-xs text-gray-400 mt-3 text-center md:text-right">Booked on:<br/>{formatDate(booking.bookingDate)}</p>
                  </div>
                </div>

                {/* Hidden Ticket element for PDF generation */}
                <div id={`ticket-${booking.id}`} style={{ display: 'none' }} className="w-[800px] p-8 bg-white text-black font-sans">
                  <div className="border-4 border-blue-600 p-8 rounded-xl relative">
                    <div className="flex justify-between items-center border-b-2 border-gray-200 pb-6 mb-6">
                      <div className="flex items-center gap-3">
                        <Plane size={40} className="text-blue-600" />
                        <h1 className="text-4xl font-bold text-blue-600">SkyBook</h1>
                      </div>
                      <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-400">Boarding Pass</h2>
                        <p className="text-gray-500">Booking Ref: {booking.id.toUpperCase().substring(0, 8)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8">
                      <div className="col-span-2 space-y-6">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider">Passenger Name</p>
                          <p className="text-2xl font-bold">{booking.passengerName.toUpperCase()}</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider">From</p>
                            <p className="text-3xl font-bold text-blue-900">{booking.flightDetails.from}</p>
                            <p className="text-lg">{formatTime(booking.flightDetails.departureTime)}</p>
                            <p className="text-sm">{formatDate(booking.flightDetails.departureTime)}</p>
                          </div>
                          <Plane size={32} className="text-gray-300" />
                          <div className="text-right">
                            <p className="text-sm text-gray-500 uppercase tracking-wider">To</p>
                            <p className="text-3xl font-bold text-blue-900">{booking.flightDetails.to}</p>
                            <p className="text-lg">{formatTime(booking.flightDetails.arrivalTime)}</p>
                            <p className="text-sm">{formatDate(booking.flightDetails.arrivalTime)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-l-2 border-dashed border-gray-300 pl-8 space-y-6">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider">Flight</p>
                          <p className="text-xl font-bold">{booking.flightDetails.airline}</p>
                          <p className="text-lg">{booking.flightDetails.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider">Seat</p>
                          <p className="text-4xl font-bold text-blue-600">{booking.seatNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider">Class</p>
                          <p className="text-lg font-bold">Economy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
