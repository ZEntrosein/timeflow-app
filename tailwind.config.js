/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 启用class模式的dark模式
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'timeline': {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        // 自定义主题变量
        'theme': {
          'bg-primary': 'var(--bg-primary)',
          'bg-secondary': 'var(--bg-secondary)',
          'bg-canvas': 'var(--bg-canvas)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-tertiary': 'var(--text-tertiary)',
          'border-primary': 'var(--border-primary)',
          'border-secondary': 'var(--border-secondary)',
        }
      }
    },
  },
  plugins: [],
} 