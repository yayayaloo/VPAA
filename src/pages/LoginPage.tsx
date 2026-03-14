import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust this path to where your firebase.js is located

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // FIX 1: Add React.FormEvent type to the event parameter
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Domain validation check
    if (!email.endsWith('@gordoncollege.edu.ph')) {
      return setError('Please use your official college email.');
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Change this to your actual post-login route
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      
      // FIX 2: Check if 'err' is an Error object before accessing .message
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
          className="btn-primary w-full shadow-lg shadow-primary/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-12 text-[10px] text-slate-400 font-medium">
        © 2026 Gordon College. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;