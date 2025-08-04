// 主题配色定义
export const themes = {
  light: {
    name: 'light',
    // 背景色
    background: {
      primary: 'bg-gray-200',       // 主要背景
      secondary: 'bg-gray-100',     // 次要背景
      canvas: '#e5e7eb',            // 画布背景
    },
    // 边框色
    border: {
      primary: 'border-gray-400',
      secondary: 'border-gray-300',
      canvas: '#9ca3af',
    },
    // 文字色
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-800',
      tertiary: 'text-gray-700',
      canvas: '#111827',
    },
    // UI元素
    ui: {
      toolbar: 'bg-gray-200',
      panel: 'bg-gray-200',
      contextBar: 'bg-gray-200',
    },
    // 网格和辅助线
    grid: {
      line: '#4b5563',              // 网格线颜色 - 深色，强对比
      dash: [2, 4],                 // 虚线样式
      border: '#6b7280',            // 时间轴边框颜色
      currentTime: '#ef4444',       // 当前时间指示器颜色 - 红色
    }
  },
  dark: {
    name: 'dark',
    // 背景色
    background: {
      primary: 'bg-gray-800',       // 主要背景
      secondary: 'bg-gray-700',     // 次要背景
      canvas: '#374151',            // 画布背景
    },
    // 边框色
    border: {
      primary: 'border-gray-600',
      secondary: 'border-gray-500',
      canvas: '#6b7280',
    },
    // 文字色
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-200',
      tertiary: 'text-gray-300',
      canvas: '#f9fafb',
    },
    // UI元素
    ui: {
      toolbar: 'bg-gray-800',
      panel: 'bg-gray-800',
      contextBar: 'bg-gray-800',
    },
    // 网格和辅助线
    grid: {
      line: '#e5e7eb',              // 网格线颜色 - 浅色，强对比
      dash: [2, 4],                 // 虚线样式
      border: '#9ca3af',            // 时间轴边框颜色
      currentTime: '#ef4444',       // 当前时间指示器颜色 - 红色
    }
  }
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName]; 