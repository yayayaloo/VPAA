import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-sm ${
      type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
      ) : (
        <XCircle className="text-red-600 flex-shrink-0" size={20} />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className={`p-1 rounded-lg transition-all ${
          type === 'success'
            ? 'text-emerald-600 hover:bg-emerald-100'
            : 'text-red-600 hover:bg-red-100'
        }`}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;