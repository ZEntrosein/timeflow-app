import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { getCurrentTheme } = useUIStore();
  const currentTheme = getCurrentTheme();

  useEffect(() => {
    // 入场动画
    setTimeout(() => setIsVisible(true), 10);

    // 自动关闭
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getColors = () => {
    const isDark = currentTheme.name === 'dark';
    switch (toast.type) {
      case 'success':
        return isDark 
          ? 'bg-green-800 border-green-600 text-green-100'
          : 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return isDark 
          ? 'bg-red-800 border-red-600 text-red-100'
          : 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return isDark 
          ? 'bg-yellow-800 border-yellow-600 text-yellow-100'
          : 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return isDark 
          ? 'bg-blue-800 border-blue-600 text-blue-100'
          : 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return isDark 
          ? 'theme-bg-secondary theme-border-primary theme-text-primary'
          : 'theme-bg-secondary theme-border-primary theme-text-primary';
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out transform
        ${getColors()}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="text-lg flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-xs mt-1 opacity-90">
              {toast.message}
            </div>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-xs underline mt-2 hover:no-underline transition-all duration-200"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => onClose(toast.id), 300);
          }}
          className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
}; 