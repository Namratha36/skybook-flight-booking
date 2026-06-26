import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { toast } from 'react-hot-toast';
import { Camera, Mail, User, Calendar, Lock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [dbUser, setDbUser] = useState(null);

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      
      try {
        // Fetch User Data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setDbUser(userDoc.data());
        }

        // Fetch Booking Stats
        const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        let total = 0, upcoming = 0, completed = 0;
        const now = new Date();

        querySnapshot.forEach(doc => {
          total++;
          const booking = doc.data();
          if (booking.status !== 'Cancelled') {
            const flightDate = new Date(booking.flightDetails.departureTime);
            if (flightDate > now) upcoming++;
            else completed++;
          }
        });

        setStats({ total, upcoming, completed });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0])); // preview
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let currentPhotoURL = currentUser.photoURL;

      // Upload new image if selected
      if (imageFile) {
        const fileRef = ref(storage, `profiles/${currentUser.uid}`);
        await uploadBytes(fileRef, imageFile);
        currentPhotoURL = await getDownloadURL(fileRef);
      }

      // Update Auth Profile
      await updateProfile(currentUser, {
        displayName: displayName,
        photoURL: currentPhotoURL
      });

      // Update Firestore User Document
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        email: currentUser.email,
        photoURL: currentPhotoURL,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setLoading(true);
    try {
      await updatePassword(currentUser, newPassword);
      setNewPassword('');
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password. You may need to log in again. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Sidebar: Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1"
        >
          <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-500">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition-colors">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName || 'User'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{currentUser.email}</p>

            <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-400 text-left bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <span>Joined {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString() : new Date(currentUser.metadata.creationTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen size={16} className="text-gray-400" />
                <span className="capitalize">Role: {dbUser?.isAdmin ? 'Administrator' : 'User'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 md:col-span-2 space-y-6"
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Bookings</p>
            </div>
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.upcoming}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upcoming Trips</p>
            </div>
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">{stats.completed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed Trips</p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your Name"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock size={20} className="text-gray-400" /> Security
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(var(--input))] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !newPassword}
                className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
