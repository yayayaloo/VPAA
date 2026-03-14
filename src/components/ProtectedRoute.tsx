import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
// FIX: Added 'type' keyword before 'User'
import { onAuthStateChanged, type User } from 'firebase/auth'; 
import { auth } from '../firebase'; // Adjust this path to your firebase config

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Extra layer of security: Double-check domain on the route level
      if (currentUser && !currentUser.email?.endsWith('@gordoncollege.edu.ph')) {
        auth.signOut(); // Force sign out if domain is wrong
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Optional: Replace this with your own loading spinner component
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase">Verifying Access...</p>
      </div>
    );
  }

  if (!user) {
    // If no valid user is found, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If user is valid, render the requested layout/page
  return <>{children}</>;
};

export default ProtectedRoute;