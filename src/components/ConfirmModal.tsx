import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-400" />,
          btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 shadow-lg',
          iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50 shadow-lg',
          iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        };
      case 'primary':
      default:
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 shadow-lg',
          iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        };
    }
  };

  const { icon, btn, iconBg } = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
        <button
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border shrink-0 ${iconBg}`}>{icon}</div>
          <div className="min-w-0 pr-6">
            <h3 id="confirm-modal-title" className="text-base font-bold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50 ${btn}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
