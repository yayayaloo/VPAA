import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordValidationProps {
  password: string;
  confirmPassword?: string;
}

interface ValidationRule {
  label: string;
  regex: RegExp;
  isValid: boolean;
}

const PasswordValidation: React.FC<PasswordValidationProps> = ({ password, confirmPassword = '' }) => {
  const rules: ValidationRule[] = [
    {
      label: 'Minimum 8 characters',
      regex: /.{8,}/,
      isValid: password.length >= 8
    },
    {
      label: 'At least 1 uppercase letter',
      regex: /[A-Z]/,
      isValid: /[A-Z]/.test(password)
    },
    {
      label: 'At least 1 lowercase letter',
      regex: /[a-z]/,
      isValid: /[a-z]/.test(password)
    },
    {
      label: 'At least 1 number',
      regex: /\d/,
      isValid: /\d/.test(password)
    },
    {
      label: 'At least 1 special character',
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  ];

  const allValid = rules.every(rule => rule.isValid);
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
        Password Requirements
      </p>
      <div className="space-y-2">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center gap-2">
            {rule.isValid ? (
              <Check className="text-emerald-600" size={14} />
            ) : (
              <X className="text-red-500" size={14} />
            )}
            <span className={`text-xs font-medium ${
              rule.isValid ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {rule.label}
            </span>
          </div>
        ))}
        {confirmPassword ? (
          <div className="flex items-center gap-2">
            {passwordsMatch ? (
              <Check className="text-emerald-600" size={14} />
            ) : (
              <X className="text-red-500" size={14} />
            )}
            <span className={`text-xs font-medium ${
              passwordsMatch ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              Confirm password must match
            </span>
          </div>
        ) : null}
      </div>
      {password && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              allValid && passwordsMatch ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
            <span className={`text-xs font-bold ${
              allValid && passwordsMatch ? 'text-emerald-700' : 'text-red-500'
            }`}>
              {allValid && passwordsMatch
                ? 'Password meets all requirements'
                : 'Password does not meet requirements'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordValidation;
