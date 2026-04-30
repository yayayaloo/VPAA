import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="text-red-600" size={24} />;
      case 'info':
        return <AlertTriangle className="text-blue-600" size={24} />;
      default:
        return <AlertTriangle className="text-amber-600" size={24} />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-amber-600 hover:bg-amber-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 rounded-xl flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 mb-6">{message}</p>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold text-white ${getButtonColor()} rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {confirmText}
                </button>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;