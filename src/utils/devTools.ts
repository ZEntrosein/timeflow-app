/**
 * 开发工具配置
 * 优化开发体验，减少不必要的控制台警告
 */

// 在开发环境中过滤一些常见的非关键警告
export function setupDevTools() {
  if (process.env.NODE_ENV === 'development') {
    // 过滤React DevTools提示
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args[0];
      
      // 过滤React DevTools下载提示
      if (typeof message === 'string' && message.includes('React DevTools')) {
        return;
      }
      
      // 过滤Vite HMR WebSocket警告（如果不影响功能）
      if (typeof message === 'string' && message.includes('failed to connect to websocket')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };

    // 过滤一些网络错误
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0];
      
      // 过滤favicon 404错误（已修复但可能还有缓存）
      if (typeof message === 'string' && message.includes('favicon.ico')) {
        return;
      }
      
      originalError.apply(console, args);
    };

    // 添加开发提示
    console.log(
      '%c🚀 TimeFlow Development Mode',
      'background: linear-gradient(90deg, #007bff, #0056b3); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;'
    );
    
    console.log(
      '%c💡 Tips:',
      'color: #007bff; font-weight: bold;',
      '\n• WebSocket warnings are normal and don\'t affect functionality',
      '\n• Install React DevTools for better debugging experience',
      '\n• Use "🧪 Tiptap测试" to test the new editor'
    );
  }
}

// WebSocket重连配置
export function setupWebSocketReconnect() {
  if (process.env.NODE_ENV === 'development') {
    // 监听WebSocket连接状态
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    window.addEventListener('beforeunload', () => {
      // 页面卸载时不尝试重连
      reconnectAttempts = maxReconnectAttempts;
    });

    // 如果需要，可以添加自定义的WebSocket重连逻辑
    // 但通常Vite的内置HMR已经处理得很好了
  }
}

export default { setupDevTools, setupWebSocketReconnect }; 