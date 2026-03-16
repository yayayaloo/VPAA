import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // ✨ NEW: Import Firestore methods
import { auth, db } from '../firebase'; // ✨ NEW: Make sure db is imported

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Domain validation check
    if (!email.endsWith('@gordoncollege.edu.ph')) {
      return setError('Please use your official college email.');
    }

    setLoading(true);

    try {
      // 1. Authenticate the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch the user's document from Firestore to check their status
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // 3. Route them based on their first-login flag
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
     if (userData.is_first_login === true) {
          navigate('/set-password'); // Send to Set Password page!
        } else {
          navigate('/dashboard'); // Normal login, send to Dashboard
        }
      } else {
        // Fallback just in case they don't have a Firestore document yet
        navigate('/dashboard'); 
      }

    } catch (err) {
      setError('Invalid email or password. Please try again.');
      
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unexpected error occurred', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center">
        <img src="/assets/gc-logo.png" alt="Gordon College Logo" className="w-20 h-20 mb-4" />
        <h2 className="text-lg font-bold text-sidebar tracking-tight">GORDON COLLEGE</h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar/60 font-bold mb-8">VPAA RANKING PORTAL</p>
        
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">Sign In</h3>
        <p className="text-slate-500 text-sm">To access the portal</p>
      </div>

      <form onSubmit={handleLogin} className="w-full space-y-6">
        {/* Error Message Display */}
        {error && (
          <div className="text-[12px] font-medium text-red-500 bg-red-50 p-2 rounded text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your domain email address"
            className="input-field w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
          </div>
          <input 
            type="password" 
            placeholder="••••••••"
            className="input-field w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="mt-4 flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full shadow-lg shadow-primary/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
             <span className="flex items-center gap-2">
               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Logging in...
             </span>
          ) : 'Login'}
        </button>
      </form>

      <div className="mt-12 text-[10px] text-slate-400 font-medium">
        © 2026 Gordon College. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;