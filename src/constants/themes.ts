// 主题配色定义
export const themes = {
  light: {
    name: 'light',
    // 背景色
    background: {
      primary: 'bg-gray-100',       // 主要背景 - 更浅
      secondary: 'bg-white',        // 次要背景 - 纯白
      canvas: '#f3f4f6',            // 画布背景 - 更浅的灰
      accent: 'bg-blue-50',         // 强调色背景
      hover: 'bg-gray-50',          // 悬停背景
      selected: 'bg-blue-100',      // 选中背景
    },
    // 边框色
    border: {
      primary: 'border-gray-300',
      secondary: 'border-gray-200',
      canvas: '#9ca3af',
      focus: 'border-blue-500',
    },
    // 文字色
    text: {
      primary: 'text-gray-900',     // 主文字 - 深黑
      secondary: 'text-gray-700',   // 次要文字
      tertiary: 'text-gray-500',    // 第三级文字
      canvas: '#111827',            // 画布文字
      muted: 'text-gray-400',       // 弱化文字
      link: 'text-blue-600',        // 链接文字
      error: 'text-red-600',        // 错误文字
      success: 'text-green-600',    // 成功文字
    },
    // UI元素
    ui: {
      toolbar: 'bg-white',          // 工具栏 - 纯白
      panel: 'bg-gray-50',          // 面板 - 极浅灰
      contextBar: 'bg-white',       // 上下文栏 - 纯白
      card: 'bg-white',            // 卡片背景
      modal: 'bg-white',           // 模态框背景
    },
    // 网格和辅助线
    grid: {
      line: '#374151',              // 网格线颜色 - 深色，强对比
      dash: [2, 4],                 // 虚线样式
      border: '#6b7280',            // 时间轴边框颜色
      currentTime: '#ef4444',       // 当前时间指示器颜色 - 红色
    },
    // 状态色
    status: {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
    }
  },
  dark: {
    name: 'dark',
    // 背景色
    background: {
      primary: 'bg-gray-900',       // 主要背景 - 更深
      secondary: 'bg-gray-800',     // 次要背景
      canvas: '#1f2937',            // 画布背景 - 深色
      accent: 'bg-blue-900',        // 强调色背景
      hover: 'bg-gray-700',         // 悬停背景
      selected: 'bg-blue-800',      // 选中背景
    },
    // 边框色
    border: {
      primary: 'border-gray-600',
      secondary: 'border-gray-700',
      canvas: '#6b7280',
      focus: 'border-blue-400',
    },
    // 文字色
    text: {
      primary: 'text-gray-50',      // 主文字 - 接近白色
      secondary: 'text-gray-300',   // 次要文字
      tertiary: 'text-gray-400',    // 第三级文字
      canvas: '#f9fafb',            // 画布文字
      muted: 'text-gray-500',       // 弱化文字
      link: 'text-blue-400',        // 链接文字
      error: 'text-red-400',        // 错误文字
      success: 'text-green-400',    // 成功文字
    },
    // UI元素
    ui: {
      toolbar: 'bg-gray-900',       // 工具栏 - 深色
      panel: 'bg-gray-800',         // 面板 - 中等深色
      contextBar: 'bg-gray-900',    // 上下文栏 - 深色
      card: 'bg-gray-800',         // 卡片背景
      modal: 'bg-gray-800',        // 模态框背景
    },
    // 网格和辅助线
    grid: {
      line: '#d1d5db',              // 网格线颜色 - 浅色，强对比
      dash: [2, 4],                 // 虚线样式
      border: '#9ca3af',            // 时间轴边框颜色
      currentTime: '#ef4444',       // 当前时间指示器颜色 - 红色
    },
    // 状态色
    status: {
      info: 'bg-blue-900 text-blue-200',
      warning: 'bg-yellow-900 text-yellow-200',
      error: 'bg-red-900 text-red-200',
      success: 'bg-green-900 text-green-200',
    }
  }
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName]; 