import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { themes, ThemeName, type Theme } from '../../constants/themes';

export interface ThemeStore {
  // 状态
  currentTheme: ThemeName;
  
  // 操作
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  getCurrentTheme: () => Theme;
  
  // 主题相关设置
  autoSwitch: boolean;
  followSystem: boolean;
  setAutoSwitch: (enabled: boolean) => void;
  setFollowSystem: (enabled: boolean) => void;
}

// 应用主题到DOM的工具函数
const applyThemeToDOM = (theme: ThemeName) => {
  const htmlElement = document.documentElement;
  
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
  
  // 更新CSS变量（如果需要）
  const themeData = themes[theme];
  // 可以在这里添加自定义CSS变量设置
  // 目前主题使用Tailwind CSS类，不需要额外的CSS变量
};

// 检测系统主题
const getSystemTheme = (): ThemeName => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentTheme: 'light',
        autoSwitch: false,
        followSystem: false,

        setTheme: (theme) => {
          set({ currentTheme: theme });
          applyThemeToDOM(theme);
        },

        toggleTheme: () => {
          const currentTheme = get().currentTheme;
          const newTheme: ThemeName = currentTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        getCurrentTheme: () => {
          const currentTheme = get().currentTheme;
          return themes[currentTheme];
        },

        setAutoSwitch: (enabled) => {
          set({ autoSwitch: enabled });
          
          if (enabled && get().followSystem) {
            const systemTheme = getSystemTheme();
            get().setTheme(systemTheme);
          }
        },

        setFollowSystem: (enabled) => {
          set({ followSystem: enabled });
          
          if (enabled) {
            const systemTheme = getSystemTheme();
            get().setTheme(systemTheme);
            
            // 监听系统主题变化
            if (typeof window !== 'undefined' && window.matchMedia) {
              const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              const handleChange = (e: MediaQueryListEvent) => {
                if (get().followSystem) {
                  get().setTheme(e.matches ? 'dark' : 'light');
                }
              };
              
              mediaQuery.addEventListener('change', handleChange);
              
              // 返回清理函数（在实际使用中应该保存并在组件卸载时调用）
              return () => mediaQuery.removeEventListener('change', handleChange);
            }
          }
        },
      }),
      {
        name: 'theme-store',
        // 只持久化主题设置，不持久化函数
        partialize: (state) => ({
          currentTheme: state.currentTheme,
          autoSwitch: state.autoSwitch,
          followSystem: state.followSystem,
        }),
        // 初始化时应用主题
        onRehydrateStorage: () => (state) => {
          if (state) {
            applyThemeToDOM(state.currentTheme);
          }
        },
      }
    ),
    { name: 'theme-store' }
  )
); 