import { useState } from 'react';
import { collection, addDoc, getDocs, writeBatch, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Plane, Trash2, Database, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────
// DEMO FLIGHT DATA — 15 realistic Indian-route flights
// All data is fictional. Schedules and availability are SAMPLE DATA,
// not live airline information.
// ──────────────────────────────────────────────────────────────────────

function generateDemoFlights() {
  // Use future dates relative to "now" so flights always look upcoming
  const base = new Date();
  const day = (offset) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return d;
  };

  const flight = (id, airline, flightNumber, from, to, depOffset, depH, depM, durMin, price, seats, stops) => {
    const dep = day(depOffset);
    dep.setHours(depH, depM, 0, 0);
    const arr = new Date(dep.getTime() + durMin * 60000);
    return {
      _demoId: id, // used for idempotency check
      airline,
      flightNumber,
      from,
      to,
      departureTime: dep.toISOString(),
      arrivalTime: arr.toISOString(),
      durationMinutes: durMin,
      price,
      availableSeats: seats,
      baggage: '7kg Cabin, 15kg Check-in',
      class: 'Economy',
      stops,
      status: 'On Time',
      amenities: ['In-flight meal', 'Entertainment', 'USB Power'],
      isDemo: true,
    };
  };

  return [
    // Hyderabad → Bengaluru (2 flights)
    flight('DEMO-F01', 'IndiGo',    '6E-2145', 'Hyderabad', 'Bengaluru',  3,  6, 30,  75, 3850, 42, 0),
    flight('DEMO-F02', 'Air India',  'AI-524',  'Hyderabad', 'Bengaluru',  5, 14, 15,  80, 4200, 28, 0),

    // Hyderabad → Delhi (2 flights)
    flight('DEMO-F03', 'Vistara',    'UK-876',  'Hyderabad', 'Delhi',      4,  7, 0,  130, 5600, 35, 0),
    flight('DEMO-F04', 'IndiGo',     '6E-3321', 'Hyderabad', 'Delhi',      7, 18, 45, 225, 4900, 18, 1),

    // Hyderabad → Mumbai (2 flights)
    flight('DEMO-F05', 'SpiceJet',   'SG-401',  'Hyderabad', 'Mumbai',     2,  9, 0,   90, 3600, 52, 0),
    flight('DEMO-F06', 'Akasa Air',  'QP-118',  'Hyderabad', 'Mumbai',     6, 16, 30,  85, 3450, 60, 0),

    // Hyderabad → Chennai (2 flights)
    flight('DEMO-F07', 'Air India',  'AI-617',  'Hyderabad', 'Chennai',    3, 11, 0,   70, 3200, 44, 0),
    flight('DEMO-F08', 'IndiGo',     '6E-7789', 'Hyderabad', 'Chennai',    8, 20, 15,  75, 3100, 33, 0),

    // Bengaluru → Delhi (2 flights)
    flight('DEMO-F09', 'Vistara',    'UK-830',  'Bengaluru', 'Delhi',      5,  5, 45, 165, 6200, 20, 0),
    flight('DEMO-F10', 'Air India',  'AI-505',  'Bengaluru', 'Delhi',      9, 12, 0,  250, 5100, 8,  1),

    // Mumbai → Kolkata (2 flights)
    flight('DEMO-F11', 'IndiGo',     '6E-5590', 'Mumbai',    'Kolkata',    4, 10, 30, 155, 5400, 37, 0),
    flight('DEMO-F12', 'SpiceJet',   'SG-723',  'Mumbai',    'Kolkata',    6, 22, 0,  160, 4800, 14, 0),

    // Chennai → Hyderabad (1 flight — return leg)
    flight('DEMO-F13', 'Akasa Air',  'QP-244',  'Chennai',   'Hyderabad',  4, 17, 30,  70, 3000, 55, 0),

    // Delhi → Mumbai (1 flight — popular trunk route)
    flight('DEMO-F14', 'Vistara',    'UK-945',  'Delhi',     'Mumbai',     3, 15, 0,  130, 5800, 12, 0),

    // Kolkata → Bengaluru (1 flight)
    flight('DEMO-F15', 'Air India',  'AI-772',  'Kolkata',   'Bengaluru',  7,  8, 0,  170, 5900, 22, 0),
  ];
}

// ──────────────────────────────────────────────────────────────────────
// DEMO BOOKING DATA — 8 sample bookings
// Connected to flights above via _demoId. All personal details are
// entirely fictional.
// ──────────────────────────────────────────────────────────────────────

function generateDemoBookings(flightMap, demoUserId) {
  const base = new Date();
  const pastDate = (daysAgo) => {
    const d = new Date(base);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  const booking = (id, flightDemoId, passenger, email, phone, seat, status, paymentStatus, daysAgo, passengers = 1) => {
    const fl = flightMap[flightDemoId];
    if (!fl) return null;
    return {
      _demoId: id,
      bookingRef: `SKB-${id}`,
      userId: demoUserId,
      flightId: fl.docId,
      passengerName: passenger,
      email,
      phone,
      seatNumber: seat,
      passengers,
      totalPrice: fl.price * passengers,
      bookingDate: pastDate(daysAgo),
      travelDate: fl.departureTime,
      status,
      paymentStatus,
      isDemo: true,
      flightDetails: {
        airline: fl.airline,
        flightNumber: fl.flightNumber,
        from: fl.from,
        to: fl.to,
        departureTime: fl.departureTime,
        arrivalTime: fl.arrivalTime,
        durationMinutes: fl.durationMinutes,
      },
    };
  };

  return [
    booking('DEMO-B01', 'DEMO-F01', 'Aarav Sharma',    'aarav.demo@skybook.in',    '+91 98765 43210', '3A', 'Confirmed', 'Demo Paid', 5),
    booking('DEMO-B02', 'DEMO-F03', 'Priya Reddy',     'priya.demo@skybook.in',    '+91 87654 32109', '7C', 'Confirmed', 'Demo Paid', 4),
    booking('DEMO-B03', 'DEMO-F05', 'Rohan Mehta',     'rohan.demo@skybook.in',    '+91 76543 21098', '2B', 'Confirmed', 'Demo Paid', 3),
    booking('DEMO-B04', 'DEMO-F09', 'Sneha Iyer',      'sneha.demo@skybook.in',    '+91 65432 10987', '5D', 'Confirmed', 'Demo Paid', 2),
    booking('DEMO-B05', 'DEMO-F11', 'Vikram Choudhary','vikram.demo@skybook.in',   '+91 54321 09876', '1A', 'Pending',   'Pending',   1),
    booking('DEMO-B06', 'DEMO-F07', 'Ananya Nair',     'ananya.demo@skybook.in',   '+91 43210 98765', '8F', 'Cancelled', 'Failed',    6),
    booking('DEMO-B07', 'DEMO-F14', 'Karthik Joshi',   'karthik.demo@skybook.in',  '+91 32109 87654', '4E', 'Confirmed', 'Demo Paid', 1),
    booking('DEMO-B08', 'DEMO-F06', 'Meera Kapoor',    'meera.demo@skybook.in',    '+91 21098 76543', '6B', 'Pending',   'Pending',   0),
  ].filter(Boolean);
}

// ──────────────────────────────────────────────────────────────────────
// Dedicated demo user UID constant
// We create a Firestore users document for the demo user.
// The demo user will log in through Firebase Auth with email/password
// that you create once in the Firebase Console (or via registration).
// ──────────────────────────────────────────────────────────────────────

const DEMO_USER_ID  = 'demo-user-skybook-2024';
const DEMO_USER_DOC = {
  uid: DEMO_USER_ID,
  email: 'demo@skybook.in',
  displayName: 'Demo User',
  role: 'admin',           // so the demo account can also view admin dashboard
  createdAt: '2024-01-15T10:30:00.000Z',
  isDemo: true,
};

export default function SeedData() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ─── PROMOTE CURRENT USER TO ADMIN ───────────────────────────────
  const handleMakeAdmin = async () => {
    if (!currentUser) {
      toast.error('Please log in first to grant admin privileges.');
      return;
    }
    setAdminLoading(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'Admin User',
        role: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Your account is now an Admin! You can access /admin');
    } catch (error) {
      console.error('Error granting admin:', error);
      toast.error('Failed to grant admin: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // ─── IDEMPOTENT SEED ──────────────────────────────────────────────
  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    try {
      // 1. Check for existing demo flights (idempotency)
      const existingFlights = await getDocs(collection(db, 'flights'));
      const existingDemoIds = new Set();
      existingFlights.docs.forEach(d => {
        if (d.data()._demoId) existingDemoIds.add(d.data()._demoId);
      });

      // 2. Seed flights (skip duplicates)
      const flights = generateDemoFlights();
      const flightMap = {}; // _demoId → { docId, ...data }
      let flightsAdded = 0;

      for (const fl of flights) {
        if (existingDemoIds.has(fl._demoId)) {
          // Already exists — find its doc id
          const existing = existingFlights.docs.find(d => d.data()._demoId === fl._demoId);
          flightMap[fl._demoId] = { docId: existing.id, ...existing.data() };
          continue;
        }
        const docRef = await addDoc(collection(db, 'flights'), fl);
        flightMap[fl._demoId] = { docId: docRef.id, ...fl };
        flightsAdded++;
      }

      // 3. Ensure demo user document exists
      await setDoc(doc(db, 'users', DEMO_USER_ID), DEMO_USER_DOC, { merge: true });
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          role: 'admin'
        }, { merge: true });
      }

      // 4. Check for existing demo bookings (idempotency)
      const existingBookings = await getDocs(collection(db, 'bookings'));
      const existingBookingDemoIds = new Set();
      existingBookings.docs.forEach(d => {
        if (d.data()._demoId) existingBookingDemoIds.add(d.data()._demoId);
      });

      // 5. Seed bookings (skip duplicates)
      // Connect to currently logged in user if available, else DEMO_USER_ID
      const targetUserId = currentUser ? currentUser.uid : DEMO_USER_ID;
      const bookings = generateDemoBookings(flightMap, targetUserId);
      let bookingsAdded = 0;

      for (const bk of bookings) {
        if (existingBookingDemoIds.has(bk._demoId)) continue;
        await addDoc(collection(db, 'bookings'), bk);
        bookingsAdded++;
      }

      setResult({ 
        success: true, 
        flightsAdded, 
        bookingsAdded, 
        totalFlights: flights.length,
        totalBookings: bookings.length,
        skippedFlights: flights.length - flightsAdded,
        skippedBookings: bookings.length - bookingsAdded,
      });
      toast.success(`Seeded ${flightsAdded} flights & ${bookingsAdded} bookings!`);
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data: ' + error.message);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ─── CLEAR ONLY DEMO DATA ────────────────────────────────────────
  const handleClear = async () => {
    if (!window.confirm("Delete all DEMO flight and booking records? (Non-demo data is preserved)")) return;

    setLoading(true);
    setResult(null);
    try {
      let cleared = 0;

      // Delete demo flights
      const flightSnap = await getDocs(collection(db, 'flights'));
      const flightBatch = writeBatch(db);
      flightSnap.docs.forEach(d => {
        if (d.data().isDemo || d.data()._demoId) {
          flightBatch.delete(doc(db, 'flights', d.id));
          cleared++;
        }
      });
      await flightBatch.commit();

      // Delete demo bookings
      const bookingSnap = await getDocs(collection(db, 'bookings'));
      const bookingBatch = writeBatch(db);
      bookingSnap.docs.forEach(d => {
        if (d.data().isDemo || d.data()._demoId) {
          bookingBatch.delete(doc(db, 'bookings', d.id));
          cleared++;
        }
      });
      await bookingBatch.commit();

      setResult({ success: true, cleared });
      toast.success(`Cleared ${cleared} demo records.`);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-[hsl(var(--background))] px-4 pt-24">
      <div className="bg-white dark:bg-[hsl(var(--card))] p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-6">
          <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Database size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Demo Data Seeder</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Populate the database with realistic sample flights and bookings for demonstration purposes.
            Running seed multiple times will <strong>not</strong> create duplicates.
          </p>
        </div>

        {/* Seed info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-sm text-amber-800 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <strong>Sample Data Notice:</strong> All flights, bookings, passenger names, and payment statuses are <em>entirely fictional</em>. 
              No real airline schedules, no real personal information, no real payments.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center text-sm mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">15</p>
            <p className="text-gray-600 dark:text-gray-400">Demo Flights</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">8</p>
            <p className="text-gray-600 dark:text-gray-400">Demo Bookings</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            <Plane size={20} />
            {loading ? 'Seeding...' : 'Seed Demo Data (Idempotent)'}
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-red-600 dark:text-red-500 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            <Trash2 size={20} />
            {loading ? 'Clearing...' : 'Clear Demo Data Only'}
          </button>

          {currentUser && (
            <button
              onClick={handleMakeAdmin}
              disabled={adminLoading}
              className="w-full flex items-center justify-center gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              <ShieldCheck size={18} />
              {adminLoading ? 'Updating role...' : `Make Logged-in User (${currentUser.email || 'You'}) Admin`}
            </button>
          )}
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`mt-6 p-4 rounded-xl text-sm ${result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}
          >
            {result.success ? (
              <div className="flex items-start gap-2">
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                <div>
                  {result.flightsAdded !== undefined ? (
                    <>
                      <strong>Seed Complete!</strong>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        <li>Flights added: {result.flightsAdded} (skipped: {result.skippedFlights})</li>
                        <li>Bookings added: {result.bookingsAdded} (skipped: {result.skippedBookings})</li>
                      </ul>
                    </>
                  ) : (
                    <><strong>Clear Complete!</strong> Removed {result.cleared} demo records.</>
                  )}
                </div>
              </div>
            ) : (
              <><strong>Error:</strong> {result.error}</>
            )}
          </div>
        )}

        {/* Demo credentials info */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Demo Account</h3>
          <p className="mb-1">After seeding, register or use an existing account to view bookings.</p>
          <p>The demo bookings are linked to a demo user. To see them under "My Bookings", 
             log in with the demo account or use the Admin Dashboard (any admin account) to view all bookings.</p>
        </div>
      </div>
    </div>
  );
}
