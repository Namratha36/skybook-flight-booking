// Realistic Indian Route Demo Flights & Sample Data
// Schedules and availability are sample data for demonstration.

export function getDemoFlights() {
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
      id,
      _demoId: id,
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

export function getDemoBookings(demoUserId = 'demo-user-skybook-2024') {
  const flights = getDemoFlights();
  const flightMap = {};
  flights.forEach(f => { flightMap[f.id] = f; });

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
      id,
      _demoId: id,
      bookingRef: `SKB-${id}`,
      userId: demoUserId,
      flightId: fl.id,
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

export const DEMO_USER_ID = 'demo-user-skybook-2024';
export const DEMO_USER_DOC = {
  uid: DEMO_USER_ID,
  email: 'demo@skybook.in',
  displayName: 'Demo User',
  role: 'admin',
  createdAt: '2024-01-15T10:30:00.000Z',
  isDemo: true,
};
