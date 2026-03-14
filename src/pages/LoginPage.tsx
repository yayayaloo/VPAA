import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center">
        <img src="/assets/gc-logo.png" alt="Gordon College Logo" className="w-20 h-20 mb-4" />
        <h2 className="text-lg font-bold text-sidebar tracking-tight">GORDON COLLEGE</h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar/60 font-bold mb-8">VPAA RANKING PORTAL</p>
        
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">Sign In</h3>
        <p className="text-slate-500 text-sm">To access the portal</p>
      </div>

      <form className="w-full space-y-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your domain email address"
            className="input-field"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
          </div>
          <input 
            type="password" 
            placeholder="••••••••"
            className="input-field"
          />
          <div className="mt-4 flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full shadow-lg shadow-primary/20 mt-4">
          Login
        </button>
      </form>

      <div className="mt-12 text-[10px] text-slate-400 font-medium">
        © 2026 Gordon College. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
