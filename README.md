# SkyBook - Premium Flight Booking Application

![SkyBook Hero Image](/public/favicon.png) <!-- Replace with actual screenshot -->

SkyBook is a modern, full-stack web application designed to deliver a seamless, premium flight booking experience. Built with React, Vite, and Tailwind CSS, it offers a fast, responsive, and beautiful user interface. 

## ✨ Features

- **Flight Search & Booking**: Search for flights with extensive filtering and sorting capabilities.
- **Seat Selection**: Interactive seat selection during checkout.
- **User Authentication**: Secure Login, Registration, and Google Sign-in via Firebase.
- **User Dashboard**: Manage your bookings, view PDF tickets, edit your profile, and see travel statistics.
- **Dark Mode**: Fully supported, system-aware dark mode with smooth transitions.
- **Admin Dashboard**: Comprehensive admin tools for managing flights (CRUD), viewing total platform revenue, and modifying user roles.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **State Management**: Zustand, React Context
- **Routing**: React Router v7
- **Backend/DB**: Firebase Authentication, Cloud Firestore, Cloud Storage
- **Data Visualization**: Recharts

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/skybook.git
   cd skybook
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

SkyBook is ready to be deployed to platforms like **Firebase Hosting** and **Vercel**. 
The build command creates an optimized production bundle:
```bash
npm run build
```

## 📸 Screenshots

*(Add screenshots of your application here)*
- Homepage
- Flight Search Results
- Admin Dashboard
- PDF Ticket Generation

---
*Built with ❤️ by Namra.*
