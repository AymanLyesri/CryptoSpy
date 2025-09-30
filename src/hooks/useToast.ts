'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
}

interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string, 
    type: Toast['type'] = 'info', 
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
  };
}