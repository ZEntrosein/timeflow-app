import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ToastMessage } from '../../components/UI/Toast';

export interface ToastStore {
  // 状态
  toasts: ToastMessage[];
  
  // 操作
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // 便捷方法
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  
  // 配置
  maxToasts: number;
  defaultDuration: number;
  setMaxToasts: (max: number) => void;
  setDefaultDuration: (duration: number) => void;
}

// 生成唯一ID
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useToastStore = create<ToastStore>()(
  devtools(
    (set, get) => ({
      toasts: [],
      maxToasts: 5,
      defaultDuration: 5000,

      addToast: (toast) => {
        const id = generateId();
        const defaultToast = {
          id,
          type: 'info' as const,
          duration: get().defaultDuration,
          title: undefined as string | undefined,
          message: '',
        };
        
        const newToast: ToastMessage = {
          ...defaultToast,
          ...toast,
          id, // 确保id不被覆盖
        };

        set((state) => {
          let newToasts = [...state.toasts, newToast];
          
          // 限制最大通知数量
          if (newToasts.length > state.maxToasts) {
            newToasts = newToasts.slice(-state.maxToasts);
          }
          
          return { toasts: newToasts };
        });

        // 自动移除通知（如果设置了duration）
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        })),

      clearToasts: () =>
        set({ toasts: [] }),

      // 便捷方法
      showSuccess: (message, title) => {
        get().addToast({
          type: 'success',
          title: title || '成功',
          message,
          duration: 3000,
        });
      },

      showError: (message, title) => {
        get().addToast({
          type: 'error',
          title: title || '错误',
          message,
          duration: 6000, // 错误信息显示更长时间
        });
      },

      showWarning: (message, title) => {
        get().addToast({
          type: 'warning',
          title: title || '警告',
          message,
          duration: 4000,
        });
      },

      showInfo: (message, title) => {
        get().addToast({
          type: 'info',
          title: title || '提示',
          message,
          duration: get().defaultDuration,
        });
      },

      setMaxToasts: (max) =>
        set({ maxToasts: Math.max(1, Math.min(10, max)) }),

      setDefaultDuration: (duration) =>
        set({ defaultDuration: Math.max(1000, Math.min(30000, duration)) }),
    }),
    { name: 'toast-store' }
  )
); 