import { User } from 'lucide-react';

const SetPasswordPage = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center text-center">
        <img src="/assets/gc-logo.png" alt="Gordon College Logo" className="w-16 h-16 mb-4" />
        <h2 className="text-base font-bold text-sidebar tracking-tight">GORDON COLLEGE</h2>
        <p className="text-[9px] uppercase tracking-[0.2em] text-sidebar/60 font-bold mb-4">VPAA RANKING PORTAL</p>
        
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 border border-accent/20">
          First Login — Action Required
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">Set New Password</h3>
        <p className="text-slate-500 text-sm max-w-[280px]">Replace your temporary password to activate your account.</p>
      </div>

      {/* User Info Card */}
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-2.5 rounded-full">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">David Bryan B. Candido</p>
          <p className="text-xs text-slate-500">202011090@gordoncollege.edu.ph</p>
        </div>
      </div>

      <form className="w-full space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Temporary Password</label>
          <input 
            type="password" 
            placeholder="Enter your temporary password"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">New Password</label>
          <input 
            type="password" 
            placeholder="Create a strong password"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Confirm New Password</label>
          <input 
            type="password" 
            placeholder="Re-enter your new password"
            className="input-field"
          />
        </div>

        <button type="submit" className="btn-primary w-full shadow-lg shadow-primary/20 mt-4">
          Update Password
        </button>
      </form>

      <div className="mt-8 text-[10px] text-slate-400 font-medium">
        © 2026 Gordon College. All rights reserved.
      </div>
    </div>
  );
};

export default SetPasswordPage;
