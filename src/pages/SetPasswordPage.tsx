import React, { useEffect, useMemo, useState } from 'react';
import { User, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import PasswordValidation from '../components/PasswordValidation';
import Toast from '../components/Toast';
import { apiService } from '../services/api';

interface UserData {
  name: string;
  email: string;
}

interface PasswordValidationState {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const validatePassword = (password: string): PasswordValidationState => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password),
});

const SetPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    temporaryPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordValidation = useMemo(() => validatePassword(newPassword), [newPassword]);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid =
    temporaryPassword.trim().length > 0 &&
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    isPasswordValid &&
    passwordsMatch;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate('/login');
          return;
        }

        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('domain_email', user.email)
          .single();

        if (!dbError && data) {
          setUserData({
            name: `${data.name_first || ''} ${data.name_last || ''}`.trim() || 'User',
            email: user.email || '',
          });
        } else {
          setUserData({
            name: 'User',
            email: user.email || '',
          });
        }
      } catch (fetchError) {
        console.error('Error fetching user data', fetchError);
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const nextFieldErrors: {
      temporaryPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!temporaryPassword.trim()) {
      nextFieldErrors.temporaryPassword = 'Temporary password is required.';
    }

    if (newPassword.length > 0 && !isPasswordValid) {
      nextFieldErrors.newPassword = 'Password must satisfy all requirements below.';
    }

    if (confirmPassword.length > 0 && !passwordsMatch) {
      nextFieldErrors.confirmPassword = 'Confirm password must match.';
    }

    setFieldErrors(nextFieldErrors);
  }, [temporaryPassword, newPassword, confirmPassword, isPasswordValid, passwordsMatch]);

  const hideToast = () => {
    setToast(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!temporaryPassword.trim()) {
      setError('Please enter your temporary password.');
      return;
    }

    if (!isPasswordValid) {
      setError('New password does not meet the requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Confirm password must match the new password.');
      return;
    }

    try {
      setLoading(true);

      const response = await apiService.updatePassword({
        temporaryPassword,
        newPassword,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setToast({
        message: response.data?.message || 'Password updated successfully!',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Failed to update password. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center text-center">
        <img src="/assets/gc-logo.png" alt="Gordon College Logo" className="w-16 h-16 mb-4" />
        <h2 className="text-base font-bold text-sidebar tracking-tight">GORDON COLLEGE</h2>
        <p className="text-[9px] uppercase tracking-[0.2em] text-sidebar/60 font-bold mb-4">
          VPAA RANKING PORTAL
        </p>

        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 border border-accent/20">
          First Login - Action Required
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">Set New Password</h3>
        <p className="text-slate-500 text-sm max-w-[280px]">
          Replace your temporary password to activate your account.
        </p>
      </div>

      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-2.5 rounded-full">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{userData.name || 'Loading...'}</p>
          <p className="text-xs text-slate-500">{userData.email || 'Loading...'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-100">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">
            Temporary Password
          </label>
          <input
            type="password"
            placeholder="Enter your temporary password"
            className="input-field"
            value={temporaryPassword}
            onChange={(event) => setTemporaryPassword(event.target.value)}
            required
          />
          {fieldErrors.temporaryPassword ? (
            <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.temporaryPassword}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">
            New Password
          </label>
          <input
            type="password"
            placeholder="Create a strong password"
            className="input-field"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <PasswordValidation password={newPassword} confirmPassword={confirmPassword} />
          </div>
          {fieldErrors.newPassword ? (
            <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.newPassword}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Re-enter your new password"
            className="input-field"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
          {fieldErrors.confirmPassword ? (
            <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="btn-primary w-full shadow-lg shadow-primary/20 mt-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-8 text-[10px] text-slate-400 font-medium">
        Ac 2026 Gordon College. All rights reserved.
      </div>

      {toast ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </div>
  );
};

export default SetPasswordPage;
