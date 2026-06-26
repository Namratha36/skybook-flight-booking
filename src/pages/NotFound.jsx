import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[hsl(var(--background))] px-4 text-center">
      <div className="mb-8 relative">
        <Plane size={120} className="text-blue-200 dark:text-blue-900 mx-auto transform -rotate-45" />
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-blue-600 dark:text-blue-500">
          404
        </span>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Oops! Looks like this flight doesn't exist. The page you are looking for has been moved or removed.
      </p>
      <Link 
        to="/" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
      >
        Back to Home
      </Link>
    </div>
  );
}
